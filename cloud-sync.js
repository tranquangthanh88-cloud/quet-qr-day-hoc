/* V7.0. Firebase auth gate, account-isolated profile sync and shared exam templates.
 * Classroom data path /users/{uid}/app/data; shared templates /sharedExams/{uid_examId}.
 * NO student names/results are ever added to public/shared collection.
 */
'use strict';
const $=id=>document.getElementById(id);
const PFX='qr_v7_sync_';
let api=null, auth=null, db=null, user=null, docRef=null, unsub=null;
let busy=false, initialized=false, timer=null, remote=null, blocked=false;
let revision='', firebaseProject='', configured=false, sessionEpoch=0;
const lastKey='qr_v7_last_trusted_account';
const ukey=(kind)=>PFX+firebaseProject+'_'+(user?.uid||'guest')+'_'+kind;
const message=(s,bad=false)=>{const e=$('cloud-status');if(e){e.textContent=s;e.className=bad?'warn':'notice'}};
function gate(s,bad=false){$('v7-gate-msg').textContent=s;$('v7-gate-msg').className=bad?'warn':'notice'}
function configFromStorage(){return window.QR_FIREBASE_CONFIG||JSON.parse(localStorage.getItem('qr_v5_sync_config')||'null')||JSON.parse(localStorage.getItem(PFX+'config')||'null')}
function parseConfig(raw){let t=String(raw||'').trim();if(!t)throw Error('Chưa có cấu hình Firebase');t=t.replace(/^\s*(?:const|let|var)\s+firebaseConfig\s*=\s*/,'').replace(/^window\.QR_FIREBASE_CONFIG\s*=\s*/,'').replace(/;\s*$/,'');t=t.replace(/([,{]\s*)([A-Za-z_$][\w$]*)\s*:/g,'$1"$2":').replace(/'/g,'"').replace(/,\s*}/g,'}');let c=JSON.parse(t);for(let f of ['apiKey','authDomain','projectId','appId'])if(typeof c[f]!=='string'||!c[f])throw Error('Thiếu '+f);return c}
function serialized(){return JSON.stringify(window.QR_CLOUD_BRIDGE.read())}
function digest(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return String(h>>>0)}
const savedHash=()=>localStorage.getItem(ukey('hash'));
const savedRev=()=>localStorage.getItem(ukey('rev'));
function remember(p,r){localStorage.setItem(ukey('hash'),digest(p));localStorage.setItem(ukey('rev'),r||'');revision=r||''}
function resetSync(){if(unsub){unsub();unsub=null}clearTimeout(timer);busy=false;initialized=false;blocked=false;revision='';remote=null;docRef=null}
function persistTrusted(){if(user)localStorage.setItem(lastKey,JSON.stringify({uid:user.uid,projectId:firebaseProject,email:user.email||'Giáo viên'}))}
function offlineChoice(){let last;try{last=JSON.parse(localStorage.getItem(lastKey)||'null')}catch{};if(last?.uid && last?.projectId && localStorage.getItem('qr_v7_user_'+last.uid+'_'+last.projectId+'_database'))$('v7-offline-zone').classList.remove('hide');else $('v7-offline-zone').classList.add('hide')}
function activate(u){window.QR_V7_AUTH_UID=u.uid;window.QR_V7_ACCOUNT.activate(u.uid+'_'+firebaseProject,u.email);persistTrusted();offlineChoice()}
function lock(){window.QR_V7_AUTH_UID=null;window.QR_V7_ACCOUNT.lock();$('cloud-user').textContent='Chưa đăng nhập';offlineChoice()}
function applyRemote(dat,ask=false){if(!dat?.payload)return false;if(ask&&!confirm('Tải dữ liệu cloud sẽ thay dữ liệu cục bộ của tài khoản này. Hãy sao lưu JSON trước. Tiếp tục?'))return false;if(ask)window.QR_CLOUD_BRIDGE.backup();let parsed=JSON.parse(dat.payload);window.QR_CLOUD_BRIDGE.apply(parsed);remember(dat.payload,dat.rev||'');remote=dat;blocked=false;return true}
function handleRemote(snap){if(!user||!initialized||busy)return;let dat=snap.data();if(!dat?.payload)return;remote=dat;const local=serialized(),rev=dat.rev||'';
 if(dat.payload===local){remember(local,rev);blocked=false;message('Đã đồng bộ.');return}
 if(!savedRev()){if(window.QR_V7_NEW_PROFILE && local===window.QR_V7_SEED_JSON){applyRemote(dat,false);window.QR_V7_NEW_PROFILE=false;message('Đã tự tải dữ liệu tài khoản về thiết bị.');return}blocked=true;message('Đã có dữ liệu cloud. Hãy sao lưu và chọn nguồn dữ liệu trong tab Đồng bộ.',true);return}
 if(savedRev()===rev){if(digest(local)!==savedHash())schedule();return}
 if(digest(local)===savedHash()){applyRemote(dat,false);message('Đã nhận thay đổi từ thiết bị khác.');return}
 blocked=true;message('XUNG ĐỘT: thiết bị và cloud cùng có thay đổi. Sao lưu, rồi chọn nguồn dữ liệu trong tab Đồng bộ.',true)
}
async function fetchProfile(myEpoch){
 try{const snap=await api.getDocFromServer(docRef);if(myEpoch!==sessionEpoch||!user)return;remote=snap.exists()?snap.data():null;initialized=true;
  if(remote?.payload){handleRemote({data:()=>remote})}else{message('Tài khoản mới chưa có dữ liệu trên cloud. Hãy tạo lớp/đề hoặc nhập dữ liệu V6 cũ.');}
  unsub=api.onSnapshot(docRef,{includeMetadataChanges:false},x=>{if(myEpoch===sessionEpoch)handleRemote(x)},err=>message('Lỗi nhận đồng bộ: '+err.message,true));
 }catch(e){initialized=true;message('Chưa tải được cloud: '+e.message+'. Dữ liệu trên thiết bị vẫn dùng được; thử đồng bộ khi có Internet.',true)}
}
async function push(force=false){if(busy||!user||!initialized||!docRef)return;
 if(!navigator.onLine){message('Không có Internet, dữ liệu được giữ cục bộ.');return}
 if(blocked&&!force){message('Đang xung đột; hãy xử lý trước.',true);return}
 const p=serialized();if(new TextEncoder().encode(p).length>850000){message('Hồ sơ vượt giới hạn 850 KB; hãy sao lưu, không thể đồng bộ nguyên gói.',true);return}
 if(!force&&digest(p)===savedHash())return;
 let u=user.uid,epoch=sessionEpoch;busy=true;message('Đang lưu lên Firestore...');
 try{let nextRev='';await api.runTransaction(db,async tx=>{let snap=await tx.get(docRef),last=snap.exists()?snap.data():null;
  if(!force&&last?.rev&&last.rev!==savedRev())throw Error('XUNG ĐỘT: một thiết bị khác đã sửa dữ liệu.');
  nextRev=(crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
  tx.set(docRef,{payload:p,rev:nextRev,savedAt:api.serverTimestamp(),schema:4});
 });
 if(epoch===sessionEpoch&&user?.uid===u){remember(p,nextRev);remote={payload:p,rev:nextRev};blocked=false;window.QR_V7_NEW_PROFILE=false;message('Đã đồng bộ lên Firebase.')} 
 }catch(e){if(/XUNG ĐỘT/.test(e.message))blocked=true;message('Chưa đồng bộ: '+e.message,true)}finally{busy=false}}
function schedule(){clearTimeout(timer);if(!user||!initialized||blocked)return;if(digest(serialized())===savedHash())return;timer=setTimeout(()=>push(),1600)}
window.addEventListener('qr-v5-db-changed',schedule);
window.addEventListener('online',()=>{if(user)schedule();else gate('Đã có Internet. Hãy đăng nhập để tiếp tục đồng bộ.')});
async function connect(config){if(configured)return;
 configured=true;firebaseProject=config.projectId;gate('Đang kết nối dịch vụ đăng nhập...');message('Đang kết nối Firebase...');
 try{const url='https://www.gstatic.com/firebasejs/13.1.0/firebase-';const [fa,authMod,store]=await Promise.all([import(url+'app.js'),import(url+'auth.js'),import(url+'firestore.js')]);
 const app=fa.initializeApp(config,'qr_v7_teacher');api={...authMod,...store};auth=authMod.getAuth(app);db=store.getFirestore(app);
 authMod.onAuthStateChanged(auth,u=>{const epoch=++sessionEpoch;resetSync();user=u;
   if(!u){lock();gate('Đăng nhập hoặc đăng ký để bắt đầu.');message('Chưa đăng nhập. Dữ liệu riêng được khóa.');return}
   activate(u);$('cloud-user').textContent='Đã đăng nhập: '+(u.email||u.uid);gate('Đã đăng nhập.');
   docRef=api.doc(db,'users',u.uid,'app','data');message('Đang tải dữ liệu tài khoản...');fetchProfile(epoch);
 });
 }catch(err){configured=false;gate('Không tải được Firebase: '+err.message+'. Nếu đang ngoại tuyến, dùng mục mở dữ liệu đã lưu trên thiết bị.',true);message('Không tải Firebase: '+err.message,true);offlineChoice();throw err}
}
async function storeConfig(raw){const config=parseConfig(raw);localStorage.setItem(PFX+'config',JSON.stringify(config));localStorage.setItem('qr_v5_sync_config',JSON.stringify(config));$('cloud-config').value=JSON.stringify(config,null,2);$('v7-config').value=JSON.stringify(config,null,2);if(configured){message('Đã lưu cấu hình, hãy tải lại trang để đổi dự án.');gate('Đã lưu, hãy tải lại trang.');return}await connect(config)}
async function signIn(register=false){if(!auth)throw Error('Chưa kết nối Firebase. Nhập cấu hình ở mục Cài đặt trước.');const email=($('v7-email').value||$('cloud-email').value).trim();const password=$('v7-password').value||$('cloud-password').value;if(!email||!password)throw Error('Nhập email và mật khẩu');if(register){if(!confirm('Tạo tài khoản giáo viên mới?'))return;await api.createUserWithEmailAndPassword(auth,email,password)}else await api.signInWithEmailAndPassword(auth,email,password);$('v7-password').value='';$('cloud-password').value=''}
function wire(id,fn){const e=$(id);if(e)e.onclick=async()=>{try{await fn()}catch(err){gate(err.message,true);message(err.message,true)}}}
wire('v7-login',()=>signIn(false));wire('v7-register',()=>signIn(true));wire('v7-reset',async()=>{if(!auth)throw Error('Chưa kết nối Firebase');const email=$('v7-email').value.trim();if(!email)throw Error('Nhập email để nhận liên kết đặt lại mật khẩu');await api.sendPasswordResetEmail(auth,email);gate('Đã gửi yêu cầu đặt lại mật khẩu. Kiểm tra hộp thư nếu email được đăng ký.')});
wire('v7-save-config',()=>storeConfig($('v7-config').value));wire('cloud-save-config',()=>storeConfig($('cloud-config').value));
wire('cloud-login',()=>{if($('cloud-email').value){$('v7-email').value=$('cloud-email').value;$('v7-password').value=$('cloud-password').value}return signIn(false)});
wire('cloud-register',()=>{if($('cloud-email').value){$('v7-email').value=$('cloud-email').value;$('v7-password').value=$('cloud-password').value}return signIn(true)});
async function signOut(){if(!auth){localStorage.removeItem(lastKey);user=null;lock();return}if(!confirm('Đăng xuất tài khoản giáo viên? Bài làm chưa đồng bộ vẫn ở kho cục bộ riêng của tài khoản này.'))return;localStorage.removeItem(lastKey);await api.signOut(auth);user=null;lock()}
window.QR_V7_SIGNOUT=signOut;
wire('cloud-logout',signOut);
wire('cloud-reset-config',async()=>{if(!confirm('Xóa cấu hình Firebase?'))return;localStorage.removeItem(PFX+'config');localStorage.removeItem('qr_v5_sync_config');gate('Đã xóa cấu hình. Tải lại trang để thay đổi.')});
wire('cloud-upload',async()=>{if(!user)throw Error('Hãy đăng nhập');if(!confirm('Ghi đè dữ liệu cloud bằng dữ liệu của tài khoản trên thiết bị? Hãy sao lưu JSON trước.'))return;window.QR_CLOUD_BRIDGE.backup();await push(true)});
wire('cloud-download',async()=>{if(!user)throw Error('Hãy đăng nhập');const snap=await api.getDocFromServer(docRef);if(!snap.exists())throw Error('Tài khoản chưa có dữ liệu cloud');if(applyRemote(snap.data(),true))message('Đã tải dữ liệu cloud về thiết bị.')});
wire('cloud-sync-now',async()=>{if(!user)throw Error('Hãy đăng nhập');const snap=await api.getDocFromServer(docRef);remote=snap.exists()?snap.data():null;if(remote?.payload){handleRemote({data:()=>remote});if(blocked)return}await push()});
wire('v7-open-offline',()=>{if(navigator.onLine&&!confirm('Đang có Internet. Chỉ sử dụng chế độ ngoại tuyến khi không thể đăng nhập. Tiếp tục?'))return;
 const last=JSON.parse(localStorage.getItem(lastKey)||'null');if(!last?.uid||!last?.projectId)throw Error('Không có phiên đăng nhập trước trên thiết bị này.');
 if(!localStorage.getItem('qr_v7_user_'+last.uid+'_'+last.projectId+'_database'))throw Error('Không có dữ liệu ngoại tuyến của tài khoản trước.');
 firebaseProject=last.projectId;window.QR_V7_ACCOUNT.activate(last.uid+'_'+last.projectId,last.email+' · NGOẠI TUYẾN');message('Đang sử dụng cục bộ, KHÔNG đồng bộ. Khi có mạng, mở lại trang và đăng nhập để đồng bộ.');
});
// Shared templates. Firestore Security Rules prevent reading other teachers' private /users data.
function shareStatus(t,bad=false){let e=$('share-status');e.textContent=t;e.className=bad?'warn':'notice'}
function templateId(id){return user.uid+'_'+id}
function safeTemplate(ex){return {title:String(ex.title||'').slice(0,100),questionCount:ex.questionCount,
 keys:Array.from({length:ex.questionCount},(_,i)=>/^[ABCD]$/.test(ex.keys[i]||'')?ex.keys[i]:''),
 questionsText:Array.from({length:ex.questionCount},(_,i)=>({stem:String(ex.questionsText?.[i]?.stem||'').slice(0,4000),choices:Array.from({length:4},(_,j)=>String(ex.questionsText?.[i]?.choices?.[j]||'').slice(0,1000))}))}}
function setupSelects(){const own=window.QR_V7_SHARED_BRIDGE.listExams(),cls=window.QR_V7_SHARED_BRIDGE.listClasses();let ownVal=$('share-my-exam').value,clsVal=$('share-target-class').value;
 $('share-my-exam').innerHTML=own.map(x=>`<option value="${x.id}">${htmlEsc(x.title)}</option>`).join('');if(own.some(x=>x.id===ownVal))$('share-my-exam').value=ownVal;
 $('share-target-class').innerHTML=cls.map(x=>`<option value="${x.id}">${htmlEsc(x.name)}</option>`).join('');if(cls.some(x=>x.id===clsVal))$('share-target-class').value=clsVal;
}
const htmlEsc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let fetchedTemplates=[];
function renderTemplates(){let term=$('share-search').value.toLowerCase().trim(),items=fetchedTemplates.filter(x=>!term||String(x.title+' '+x.authorLabel).toLowerCase().includes(term));
 $('share-list').innerHTML=items.length?items.map(t=>`<div class="examitem"><div><b>${htmlEsc(t.title)}</b><div class="subtle">${t.questionCount} câu · ${htmlEsc(t.authorLabel||'Giáo viên')} · ${t.questionsText?.some(q=>q.stem)?'Có nội dung câu hỏi':'Chỉ có đáp án'}</div></div><button data-copy-id="${htmlEsc(t.id)}">Sao chép đề</button></div>`).join(''):'<p class="muted">Chưa có đề phù hợp.</p>';
 $('share-list').querySelectorAll('[data-copy-id]').forEach(b=>b.onclick=()=>{try{const t=fetchedTemplates.find(x=>x.id===b.dataset.copyId),target=$('share-target-class').value;if(!t||!target)throw Error('Chọn lớp nhận đề trước');if(!confirm(`Sao chép “${t.title}” về lớp đang chọn? Không lấy kết quả học sinh.`))return;window.QR_V7_SHARED_BRIDGE.importTemplate(t,target);setupSelects();shareStatus('Đã sao chép đề. Mở tab Đề thi để xem.') }catch(e){shareStatus(e.message,true)}})
}
async function refreshTemplates(){if(!user)throw Error('Hãy đăng nhập để xem thư viện');if(!navigator.onLine)throw Error('Thư viện cần Internet; các đề đã sao chép vẫn dùng ngoại tuyến.');
 shareStatus('Đang tải đề chia sẻ...');const q=api.query(api.collection(db,'sharedExams'),api.orderBy('publishedAt','desc'),api.limit(60));const snap=await api.getDocs(q);fetchedTemplates=snap.docs.map(d=>({id:d.id,...d.data()}));renderTemplates();shareStatus('Đã tải '+fetchedTemplates.length+' đề chia sẻ.');
}
wire('share-refresh',refreshTemplates);$('share-search').oninput=renderTemplates;
window.addEventListener('qr-v7-library-open',()=>{setupSelects();if(user&&navigator.onLine)refreshTemplates().catch(e=>shareStatus(e.message,true))});
wire('share-publish',async()=>{if(!user)throw Error('Cần đăng nhập Firebase');if(!navigator.onLine)throw Error('Phải có Internet để chia sẻ đề');
 const ex=window.QR_V7_SHARED_BRIDGE.listExams().find(x=>x.id===$('share-my-exam').value);if(!ex)throw Error('Chọn đề để chia sẻ');const p=safeTemplate(ex);
 const dat={ownerUid:user.uid,sourceExamId:ex.id,authorLabel:($('share-author').value.trim().slice(0,50)||'Giáo viên'),...p,publishedAt:api.serverTimestamp(),version:1};
 if(new TextEncoder().encode(JSON.stringify(dat)).length>350000)throw Error('Nội dung đề quá dài (>350 KB), cần rút gọn hình và công thức');
 if(!confirm(`Công bố “${ex.title}” cho giáo viên đã đăng nhập? Đề sẽ có cả đáp án. Không có kết quả học sinh.`))return;
 await api.setDoc(api.doc(db,'sharedExams',templateId(ex.id)),dat);shareStatus('Đã công bố đề. Các giáo viên khác có thể sao chép.');await refreshTemplates()
});
wire('share-unpublish',async()=>{if(!user)throw Error('Chưa đăng nhập');const id=$('share-my-exam').value;if(!id)throw Error('Chọn đề');if(!confirm('Gỡ chia sẻ đề này? Người khác đã sao chép vẫn giữ bản sao của họ.'))return;
 await api.deleteDoc(api.doc(db,'sharedExams',templateId(id)));shareStatus('Đã gỡ chia sẻ.');await refreshTemplates()
});
// Startup and optional trusted offline profile.
offlineChoice();
try{const c=configFromStorage();if(c){$('cloud-config').value=JSON.stringify(c,null,2);$('v7-config').value=JSON.stringify(c,null,2);connect(c).catch(()=>{})}else gate('Ứng dụng chưa được kết nối Firebase. Vui lòng liên hệ quản trị viên để thiết lập.',true)}catch(e){gate('Cấu hình Firebase không hợp lệ: '+e.message,true)}
