/* Teacher QR collection: separate from the original paper marker scanner. */
'use strict';
(function(){
 const el=id=>document.getElementById(id);
 let cam=null,tickTimer=null,scanBusy=false,lastRaw='',lastAt=0,totalImported=0;
 const say=(s,bad=false)=>{el('group-collect-status').textContent=s;el('group-collect-status').className=bad?'warn':'notice'};
 function context(){const ex=activeExam(),cls=activeClass();if(!ex||!cls||!S)throw Error('Cần chọn lớp và đề trước');return {ex,cls,se:getSession(ex,cls),num:ex.questionCount}}
 function token(create=false){const c=context();if(create&&!c.se.qrSessionCode){c.se.qrSessionCode=QRWire.shortToken();saveDB()}return c.se.qrSessionCode||null}
 function hideStart(){el('teacher-start-qr').classList.add('hide');el('teacher-qr-meta').textContent='Nhập thời gian rồi nhấn “Tạo QR với thời gian đã nhập” để phát đề. QR cũ (nếu có) chưa được hiển thị.'}
 function loadSettings(){try{const c=context();el('teacher-duration').value=c.se.timeLimitMinutes??20;el('teacher-policy').value=c.se.focusPolicy||'warn'}catch(e){}hideStart();refreshCount()}
 function renderStart(){try{
  const c=context(),duration=Number(el('teacher-duration').value),policy=el('teacher-policy').value;
  if(el('teacher-duration').value.trim()===''||!Number.isInteger(duration)||duration<0||duration>180)throw Error('Hãy nhập thời gian từ 0 đến 180 phút trước khi tạo QR');
  if(!['warn','strict'].includes(policy))throw Error('Chế độ giám sát không hợp lệ');
  const changed=duration!==(c.se.timeLimitMinutes??20)||policy!==(c.se.focusPolicy||'warn');
  if(changed&&Object.keys(c.se.qrSubmissions||{}).length)throw Error('Phiên đã thu bài. Không được thay đổi thời gian hoặc chế độ giám sát; hãy tạo đề/phiên mới.');
  if(changed&&c.se.qrSessionCode){if(!confirm('Thay đổi thời gian/chế độ sẽ tạo mã phiên mới. Mọi học sinh đã quét mã cũ phải quét lại. Tiếp tục?'))return;c.se.qrSessionCode=null}
  c.se.timeLimitMinutes=duration;c.se.focusPolicy=policy;
  const t=token(true);saveDB();const raw=QRWire.session(t,c.num,c.cls.name,c.ex.title,duration,policy);
  QRGen.render(raw,el('teacher-start-qr'),330);el('teacher-start-qr').classList.remove('hide');
  el('teacher-qr-meta').textContent=`QR đã tạo · ${c.cls.name} · ${c.ex.title} · ${c.num} câu · ${duration?`${duration} phút`:'Không giới hạn'} · ${policy==='strict'?'khóa lần 1':'khóa lần 2'} · Mã phiên ${t}`;
  say('Đã tạo QR với thời gian '+(duration?duration+' phút':'không giới hạn')+'. Chiếu QR để học sinh quét; đồng hồ bắt đầu ngay trên từng điện thoại khi nhận mã.');refreshCount();
 }catch(e){say(e.message,true)}}
 function refreshCount(){try{const c=context(),present=c.se.roster.filter(x=>!new Set(c.se.absentIds||[]).has(x.id));let submitted=present.filter(st=>c.se.qrSubmissions?.[st.id]||c.se.answers?.some(a=>a&&a[st.id])).length;el('group-stats').textContent=`Đã có bài: ${submitted}/${present.length} học sinh. Mỗi QR nhóm thu tối đa 8 bài; không tính trùng.`}catch(e){el('group-stats').textContent='Chưa có lớp/đề hợp lệ'}}
 function importRaw(raw){const item=QRWire.parseGroup(raw),c=context(),t=token(false);if(!t)throw Error('Hãy tạo mã QR bắt đầu đề trước');if(item.token!==t||item.n!==c.num)throw Error('QR không thuộc lớp/đề/phiên đang chọn');const roster=new Map(c.se.roster.map(x=>[x.id,x]));c.se.qrSubmissions=c.se.qrSubmissions||{};let newEntries=0,identical=0,conflicts=[],unknown=[],accepted=[];
 for(const p of item.items){const student=roster.get(p.id);if(!student){unknown.push(p.id);continue}const signature=QRWire.checksum(p.answers.join(','));const previous=c.se.qrSubmissions[p.id];let conflict=!!previous&&previous.sig!==signature;for(let i=0;i<c.num;i++){const old=c.se.answers?.[i]?.[p.id]||'';if(old&&old!==(p.answers[i]||''))conflict=true}if(conflict){conflicts.push(p.id);continue}if(previous){identical++;continue}
 for(let i=0;i<c.num;i++){if(!c.se.answers[i])c.se.answers[i]={};if(p.answers[i]){c.se.answers[i][p.id]=p.answers[i]}}
 c.se.qrSubmissions[p.id]={sig:signature,receivedAt:new Date().toISOString(),awayCount:p.awayCount||0,lockReason:p.lockReason||''};c.se.absentIds=(c.se.absentIds||[]).filter(id=>+id!==p.id);accepted.push(`${String(p.id).padStart(2,'0')} · ${student.name}`);newEntries++;
 }
 if(newEntries){S=materialize();store();renderScan();totalImported+=newEntries}
 refreshCount();el('group-collect-list').innerHTML='<b>Vừa tiếp nhận:</b> '+(accepted.length?accepted.map(x=>`<div>✓ ${esc(x)}</div>`).join(''):'Không có bài mới');const flagged=item.items.filter(x=>x.awayCount>0);const warn=(conflicts.length?` · Có đáp án khác đã lưu ở mã ${conflicts.join(', ')} (không ghi đè)`:``)+(flagged.length?` · Có ${flagged.length} bài ghi nhận rời màn hình: ${flagged.map(x=>x.id).join(', ')}`:``);say(`QR gồm ${item.items.length} bài · Ghi mới ${newEntries} · Trùng ${identical} · Mã không thuộc lớp ${unknown.length}${warn}`,!!(conflicts.length||unknown.length));
 return {newEntries,identical,conflicts,unknown};
 }
 function readVideoFrame(video){const c=el('teacher-group-canvas'),w=Math.min(1280,video.videoWidth||960),h=Math.round(w*(video.videoHeight||720)/(video.videoWidth||960));c.width=w;c.height=h;c.getContext('2d').drawImage(video,0,0,w,h);return readCanvas(c)}
 function readCanvas(c){if(typeof jsQR!=='function')throw Error('Thiếu thư viện QR: cần mở ứng dụng qua Internet một lần trước khi dùng ngoại tuyến.');const d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height);return jsQR(d.data,c.width,c.height,{inversionAttempts:'attemptBoth'})?.data||null}
 async function start(){stop();try{context();if(!navigator.mediaDevices?.getUserMedia)throw Error('Cần HTTPS và quyền camera');cam=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920}},audio:false});const v=el('teacher-group-video');v.srcObject=cam;await v.play();el('teacher-group-video').classList.remove('hide');say('Đang tìm mã QR nhóm trên màn hình điện thoại…');async function loop(){if(!cam)return;try{const raw=readVideoFrame(v);if(raw&&(['G6|','S6|','G7|','S7|'].some(prefix=>raw.startsWith(prefix)))&&(raw!==lastRaw||Date.now()-lastAt>4500)&&!scanBusy){lastRaw=raw;lastAt=Date.now();scanBusy=true;try{importRaw(raw)}catch(e){say(e.message,true)}finally{scanBusy=false}}}catch(e){say(e.message,true)}tickTimer=setTimeout(loop,320)}loop()}catch(e){stop();say('Không bật được camera: '+e.message,true)}}
 function stop(){clearTimeout(tickTimer);tickTimer=null;if(cam)cam.getTracks().forEach(t=>t.stop());cam=null;el('teacher-group-video').classList.add('hide');el('teacher-group-video').srcObject=null}
 function modeChange(){const group=el('grading-mode').value==='group';el('paper-grading-zone').classList.toggle('hide',group);el('qrgroup-grading-zone').classList.toggle('hide',!group);if(group){stopCamera();loadSettings()}else stop()}
 const settingsChanged=()=>{hideStart();el('teacher-qr-meta').textContent='Thông số đã thay đổi. Nhấn “Tạo QR với thời gian đã nhập” để lưu và tạo mã mới.'};
 el('teacher-duration').addEventListener('input',settingsChanged);el('teacher-policy').addEventListener('change',settingsChanged);
 el('grading-mode').addEventListener('change',modeChange);el('btn-group-start').onclick=renderStart;
 el('btn-teacher-group-camera').onclick=start;el('btn-teacher-group-stop').onclick=stop;
 el('btn-teacher-group-photo').onclick=()=>el('teacher-group-photo').click();
 el('teacher-group-photo').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const bm=await createImageBitmap(file),c=el('teacher-group-canvas');c.width=Math.min(2000,bm.width);c.height=Math.round(c.width*bm.height/bm.width);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);const raw=readCanvas(c);if(!raw)throw Error('Không phát hiện mã QR trong ảnh');importRaw(raw);bm.close?.()}catch(e){say(e.message,true)}finally{e.target.value=''}};
 el('scan-class').addEventListener('change',()=>{if(el('grading-mode').value==='group'){stop();loadSettings()}});
 el('scan-exam').addEventListener('change',()=>{if(el('grading-mode').value==='group'){stop();loadSettings()}});
 window.QR_TEACHER_GROUP_TEST={importRaw,context,token,renderStart};
})();
