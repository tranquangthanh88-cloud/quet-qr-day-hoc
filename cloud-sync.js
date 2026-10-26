// QR lop hoc V5 - optional cloud sync, original V4 remains functional when not configured.
const PFX='qr_v5_sync_';
const $=id=>document.getElementById(id);
let api=null,auth=null,db=null,user=null,docRef=null,unsub=null;
let busy=false,initialized=false,timer=null,remote=null,blocked=false,revision=null;
const uidStorage=kind=>`${PFX}${kind}_${user?.uid||'guest'}`;
function msg(message,bad=false){const el=$('cloud-status');el.textContent=message;el.className=bad?'warn':'notice';}
function cleanObj(){return window.QR_CLOUD_BRIDGE.read()}
function serialized(){return JSON.stringify(cleanObj())}
function digest(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function savedHash(){return localStorage.getItem(uidStorage('hash'))}
function savedRevision(){return localStorage.getItem(uidStorage('rev'))}
function remember(p,rev){localStorage.setItem(uidStorage('hash'),digest(p));localStorage.setItem(uidStorage('rev'),rev);revision=rev;}
function existingConfig(){return window.QR_FIREBASE_CONFIG||JSON.parse(localStorage.getItem(PFX+'config')||'null')}
function parseConfig(raw){
 let t=raw.trim();if(!t)throw Error('Chưa có cấu hình Firebase');
 t=t.replace(/^\s*(?:const|let|var)\s+firebaseConfig\s*=\s*/,'').replace(/;\s*$/,'');
 if(t.startsWith('window.QR_FIREBASE_CONFIG'))t=t.slice(t.indexOf('=')+1).trim().replace(/;\s*$/,'');
 if(t[0]!=='{')throw Error('Hãy dán toàn bộ object firebaseConfig');
 t=t.replace(/([,{]\s*)([A-Za-z_$][\w$]*)\s*:/g,'$1"$2":').replace(/'/g,'"').replace(/,\s*}/g,'}');
 const cfg=JSON.parse(t);
 for(const k of ['apiKey','authDomain','projectId','appId'])if(typeof cfg[k]!=='string'||!cfg[k])throw Error('Thiếu '+k);
 return cfg;
}
async function loadFirebase(cfg){
 if(api)return;
 msg('Đang tải thư viện Firebase...');
 const url='https://www.gstatic.com/firebasejs/13.1.0/firebase-';
 const [app,authentication,firestore]=await Promise.all([import(url+'app.js'),import(url+'auth.js'),import(url+'firestore.js')]);
 const fa=app.initializeApp(cfg,'qr_sync_v5');
 auth=authentication.getAuth(fa);
 db=firestore.getFirestore(fa);
 api={...authentication,...firestore};
 api.onAuthStateChanged(auth,async u=>{
   user=u;$('cloud-user').textContent=u?`Đã đăng nhập: ${u.email}`:'Chưa đăng nhập';
   if(unsub){unsub();unsub=null}initialized=false;blocked=false;remote=null;docRef=null;
   if(!u){msg('Đã cấu hình Firebase. Hãy đăng nhập để đồng bộ.');return}
   docRef=api.doc(db,'users',u.uid,'app','data');
   msg('Đang kiểm tra hồ sơ đám mây...');
   try{await initializeFromCloud()}catch(e){msg('Không kiểm tra được dữ liệu: '+e.message,true)}
 });
}
function handleRemote(snap){if(!user||!initialized||busy)return;
 const dat=snap.data();if(!dat?.payload)return;
 remote=dat;
 const local=serialized(),rev=dat.rev||'',same=dat.payload===local;
 if(same){remember(local,rev);blocked=false;msg('Đã đồng bộ. Dữ liệu PC và iPhone đang giống nhau.');return}
 if(!savedRevision()){
   msg('Đã có dữ liệu trên cloud. Chọn “Lấy dữ liệu CLOUD về máy này” hoặc “Đưa dữ liệu MÁY NÀY lên cloud”.');return
 }
 if(savedRevision()===rev){if(digest(local)!==savedHash())schedule();return}
 if(digest(local)===savedHash()){
   try{applyRemote(dat,false);msg('Đã tự nhận dữ liệu cập nhật từ thiết bị khác.')}catch(e){msg(e.message,true)}
 }else{blocked=true;msg('XUNG ĐỘT: cả dữ liệu trên thiết bị và trên cloud đều thay đổi. Hãy sao lưu JSON và chọn nguồn phù hợp tại tab Đồng bộ.',true)}
}
async function initializeFromCloud(){
 try{
  const snap=await api.getDocFromServer(docRef);remote=snap.exists()?snap.data():null;initialized=true;
  if(!remote?.payload){msg('Cloud chưa có dữ liệu. Trên máy tính đang có lớp, hãy chọn “Đưa dữ liệu MÁY NÀY lên cloud”.');}
  else handleRemote({data:()=>remote});
  unsub=api.onSnapshot(docRef,{includeMetadataChanges:false},handleRemote,e=>msg('Không nghe được thay đổi: '+e.message,true));
 }catch(e){initialized=true;msg('Chưa đọc được cloud. Kiểm tra mạng Internet hoặc Security Rules. '+e.message,true)}
}
function applyRemote(dat,ask=true){
 if(!dat?.payload)throw Error('Cloud chưa có dữ liệu');
 if(ask&&!confirm('Lấy dữ liệu cloud về sẽ THAY dữ liệu trên thiết bị. Hãy sao lưu JSON trước. Tiếp tục?'))return false;
 if(ask)window.QR_CLOUD_BRIDGE.backup();
 const obj=JSON.parse(dat.payload);window.QR_CLOUD_BRIDGE.apply(obj);
 remember(dat.payload,dat.rev||'');blocked=false;remote=dat;
 return true;
}
async function push(force=false){
 if(busy||!user||!docRef||!initialized)return;
 if(!navigator.onLine){msg('Không có Internet. Dữ liệu đã lưu trên thiết bị; sẽ thử gửi lại khi có mạng.');return}
 if(blocked&&!force){msg('Đang có xung đột. Hãy sao lưu và chọn nguồn dữ liệu.',true);return}
 const p=serialized(),max=850000;
 if(new TextEncoder().encode(p).length>max){msg('Hồ sơ lớn hơn 850 KB. Chưa đẩy lên cloud. Hãy sao lưu và chia nhỏ dữ liệu.',true);return}
 if(!force&&digest(p)===savedHash())return;
 busy=true;msg('Đang lưu lên đám mây...');
 try{
   let committedRev;
   await api.runTransaction(db,async tx=>{
    const snapshot=await tx.get(docRef),old=snapshot.exists()?snapshot.data():null;
    const oldRev=old?.rev||null;
    if(!force&&oldRev&&oldRev!==savedRevision())throw Error('XUNG ĐỘT: dữ liệu cloud đã thay đổi. Không ghi đè tự động.');
    committedRev=(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
    tx.set(docRef,{payload:p,rev:committedRev,savedAt:api.serverTimestamp(),schema:4});
   });
   remote={payload:p,rev:committedRev};remember(p,committedRev);blocked=false;
   msg('Đã lưu lên cloud. iPhone/PC đăng nhập cùng tài khoản sẽ tự nhận khi trực tuyến.');
 }catch(e){
   if(/XUNG ĐỘT/.test(e.message))blocked=true;
   msg('Chưa đồng bộ: '+e.message,true)
 }finally{busy=false;}
}
function schedule(){clearTimeout(timer);if(!user||!initialized||blocked)return;if(digest(serialized())===savedHash())return;timer=setTimeout(()=>push(false),1400)}
window.addEventListener('qr-v5-db-changed',schedule);
window.addEventListener('online',()=>{if(user){msg('Đã kết nối lại Internet, đang kiểm tra thay đổi...');schedule()}});
$('cloud-save-config').onclick=async()=>{
 try{
  const cfg=parseConfig($('cloud-config').value);localStorage.setItem(PFX+'config',JSON.stringify(cfg));
  if(api){msg('Đã thay đổi cấu hình. Tải lại trang để áp dụng cấu hình mới.');return}
  await loadFirebase(cfg);
 }catch(e){msg('Lỗi cấu hình: '+e.message,true)}
};
$('cloud-reset-config').onclick=()=>{if(!confirm('Xóa cấu hình Firebase trên thiết bị? Dữ liệu lớp vẫn giữ nguyên.'))return;localStorage.removeItem(PFX+'config');msg('Đã xóa cấu hình. Tải lại trang để cập nhật.');$('cloud-config').value=''};
$('cloud-login').onclick=async()=>{try{if(!auth)throw Error('Cấu hình Firebase trước');await api.signInWithEmailAndPassword(auth,$('cloud-email').value.trim(),$('cloud-password').value);$('cloud-password').value=''}catch(e){msg('Không đăng nhập được: '+e.message,true)}};
$('cloud-register').onclick=async()=>{try{if(!auth)throw Error('Cấu hình Firebase trước');if(!confirm('Tạo tài khoản Firebase mới cho giáo viên? Dùng cùng email/mật khẩu trên iPhone.'))return;await api.createUserWithEmailAndPassword(auth,$('cloud-email').value.trim(),$('cloud-password').value);$('cloud-password').value=''}catch(e){msg('Không tạo được tài khoản: '+e.message,true)}};
$('cloud-logout').onclick=async()=>{if(auth)await api.signOut(auth);msg('Đã đăng xuất. Dữ liệu cục bộ vẫn còn trên thiết bị.')};
$('cloud-upload').onclick=()=>{if(!user)return msg('Hãy đăng nhập trước',true);if(!confirm('Đưa toàn bộ lớp, đề, điểm trên THIẾT BỊ NÀY lên cloud. Nếu cloud đã có dữ liệu khác, nó sẽ BỊ GHI ĐÈ. Bạn đã sao lưu chưa?'))return;window.QR_CLOUD_BRIDGE.backup();push(true)};
$('cloud-download').onclick=async()=>{if(!user)return msg('Hãy đăng nhập trước',true);try{const snap=await api.getDocFromServer(docRef);if(!snap.exists())return msg('Cloud chưa có dữ liệu.');if(applyRemote(snap.data(),true))msg('Đã lấy lớp, đề và kết quả từ cloud về thiết bị.')}catch(e){msg('Không thể tải về: '+e.message,true)}};
$('cloud-sync-now').onclick=async()=>{if(!user)return msg('Chưa đăng nhập',true);try{const snap=await api.getDocFromServer(docRef);remote=snap.exists()?snap.data():null;if(remote?.payload){handleRemote({data:()=>remote});if(blocked)return;}await push(false)}catch(e){msg('Không thể đồng bộ: '+e.message,true)}};
try{const cfg=existingConfig();if(cfg){$('cloud-config').value=JSON.stringify(cfg,null,2);loadFirebase(cfg).catch(e=>msg('Không kết nối Firebase: '+e.message,true))}}catch(e){msg('Cấu hình Firebase sai: '+e.message,true)}
