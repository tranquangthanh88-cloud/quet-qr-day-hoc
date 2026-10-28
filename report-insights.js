/* Quet the lop hoc V7.2.1 - thong ke dung/sai va danh sach theo cau.
   Khong phu thuoc thu vien ve bieu do hay dich vu ben ngoai. */
(function(root){
'use strict';
const COLORS={correct:'#169566',wrong:'#e36b57',missing:'#aab8c7',ungraded:'#4389bd'};
const STATES=['wrong','correct','missing','ungraded','absent'];
const VN={correct:'Đúng',wrong:'Sai',missing:'Chưa trả lời',ungraded:'Chưa chấm',absent:'Vắng'};
const safe=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nfmt=n=>String(n||0);
/** Tinh ket qua tu ban ghi cua tung hoc sinh; khong tinh hoc sinh vang vao mau so. */
function analyze(rows,exam){
 const count=Number(exam?.questionCount)||0;
 const keys=Array.isArray(exam?.keys)?exam.keys:[];
 const questions=[];
 for(let i=0;i<count;i++){
   const key=/^[ABCD]$/.test(keys[i]||'')?keys[i]:'';
   const groups={correct:[],wrong:[],missing:[],ungraded:[],absent:[]};
   for(const st of rows||[]){
     const answer=String(st.answers?.[i]||'').toUpperCase();
     const v=String(st.answers?.[i]||'');
     const state=st.absent?'absent':!answer?'missing':!key?'ungraded':answer===key?'correct':'wrong';
     groups[state].push({classId:st.classId,className:st.className||'',id:st.id,name:st.name||'',answer:v,absent:!!st.absent});
   }
   const present=(rows||[]).length-groups.absent.length;
   const answered=present-groups.missing.length;
   questions.push({index:i+1,key,groups,present,answered,
      counts:Object.fromEntries(STATES.map(x=>[x,groups[x].length])),
      correctPercent:key&&present?100*groups.correct.length/present:null,
      wrongPercent:key&&answered?100*groups.wrong.length/answered:null,
   });
 }
 return {questions,totalStudents:(rows||[]).length,
  graded:questions.filter(q=>!!q.key).length,
  difficult:[...questions].filter(q=>q.key&&q.answered>0)
   .sort((a,b)=>b.counts.wrong/b.answered-a.counts.wrong/a.answered || b.counts.wrong-a.counts.wrong || a.index-b.index).slice(0,3)};
}
let state={signature:'',model:null,selected:null,filter:'wrong'};
function percent(n,d){return d?Math.round(100*n/d):0}
function countText(q){return q.key
 ? `Đúng ${q.counts.correct} · Sai ${q.counts.wrong} · Chưa làm ${q.counts.missing}`
 : `Chưa có đáp án · Đã trả lời ${q.counts.ungraded} · Chưa làm ${q.counts.missing}`;}
function bar(q){
 if(!q.present)return '<span class="ri-none">Không có học sinh dự thi</span>';
 const types=q.key?['correct','wrong','missing']:['ungraded','missing'];
 return types.map(t=>{
   const n=q.counts[t],pc=100*n/q.present;
   return n?`<span class="ri-seg ri-${t}" style="width:${pc.toFixed(3)}%" title="${VN[t]}: ${n} (${pc.toFixed(1)}%)"></span>`:'';
 }).join('');
}
function qRow(q){
 const hasKey=!!q.key;
 const label=`Câu ${q.index}: ${countText(q)}; vắng ${q.counts.absent}`;
 return `<button type="button" class="ri-qrow${state.selected===q.index?' ri-active':''}" data-ri-question="${q.index}" aria-pressed="${state.selected===q.index?'true':'false'}" aria-label="${safe(label)}">
 <span class="ri-line"><strong>Câu ${String(q.index).padStart(2,'0')}</strong><span class="ri-result">${hasKey?`<b class="ri-green">${q.counts.correct} đúng</b><b class="ri-red">${q.counts.wrong} sai</b>`:`<b class="ri-blue">${q.counts.ungraded} chưa chấm</b>`}<span>${q.counts.missing} chưa làm</span></span></span>
 <span class="ri-track">${bar(q)}</span>
 <span class="ri-sub">${hasKey?`${percent(q.counts.correct,q.present)}% đúng trên ${q.present} học sinh có mặt`:'Chưa nhập đáp án chuẩn'} · Vắng ${q.counts.absent} · <span class="ri-link">Xem học sinh ›</span></span>
 </button>`;
}
function filterButton(t,q){const cnt=t==='all'?q.present:q.counts[t];return `<button type="button" data-ri-filter="${t}" class="ri-filter${state.filter===t?' selected':''}" aria-pressed="${state.filter===t}">${t==='all'?'Tất cả':VN[t]} <b>${cnt}</b></button>`}
function pupil(p,t){
 return `<tr><td>${safe(p.className)}</td><td>${safe(String(p.id).padStart(2,'0'))}</td><td>${safe(p.name)}</td><td>${p.absent?'—':safe(p.answer||'—')}</td><td><span class="ri-chip ri-${t}">${VN[t]}</span></td></tr>`;
}
function detail(){
 const el=document.getElementById('ri-detail');if(!el)return;
 if(!state.model||!state.selected){el.innerHTML='<div class="ri-placeholder"><strong>Chọn một câu trên biểu đồ</strong><p>Danh sách học sinh làm đúng, làm sai hoặc chưa trả lời sẽ xuất hiện tại đây.</p></div>';return;}
 const q=state.model.questions.find(x=>x.index===state.selected);if(!q){state.selected=null;return detail();}
 const filters=q.key?['wrong','correct','missing','absent','all']:['ungraded','missing','absent','all'];
 if(!filters.includes(state.filter))state.filter=q.key?'wrong':'ungraded';
 const choices=state.filter==='all'? (q.key?['wrong','correct','missing']:['ungraded','missing']):[state.filter];
 let list=choices.flatMap(t=>q.groups[t].map(p=>({p,t}))).sort((a,b)=>String(a.p.className).localeCompare(String(b.p.className),'vi')||Number(a.p.id)-Number(b.p.id));
 const explain=q.key?`Đáp án chuẩn: <b>${q.key}</b>. Sai là học sinh đã chọn một phương án khác; chưa trả lời được tách riêng.`:'<b>Câu chưa có đáp án chuẩn.</b> Những học sinh đã chọn phương án được xếp vào nhóm “Chưa chấm”, không bị tính là sai.';
 el.innerHTML=`<div class="ri-detail-head"><div><h3>Câu ${q.index} · Chi tiết học sinh</h3><p>${explain}</p></div><button type="button" class="ri-close" id="ri-close" aria-label="Đóng chi tiết">×</button></div>
 <div class="ri-filters">${filters.map(t=>filterButton(t,q)).join('')}</div>
 <div class="ri-count">${state.filter==='all'?'Có mặt':VN[state.filter]}: <strong>${list.length}</strong> học sinh</div>
 ${list.length?`<div class="ri-table-wrap"><table class="ri-table"><thead><tr><th>Lớp</th><th>Thẻ</th><th>Học sinh</th><th>Chọn</th><th>Kết quả</th></tr></thead><tbody>${list.map(({p,t})=>pupil(p,t)).join('')}</tbody></table></div>`:'<p class="ri-empty">Không có học sinh trong nhóm này.</p>'}`;
}
function render(rows,exam,scope){
 const barEl=document.getElementById('ri-chart'),overview=document.getElementById('ri-overview');
 if(!barEl||!overview)return;
 if(!exam)return clear();
 const signature=String(exam.id||exam.title)+'|'+(scope?.classIds||[]).join(',');
 if(state.signature!==signature){state.selected=null;state.filter='wrong';state.signature=signature;}
 const m=analyze(rows,exam);state.model=m;
 overview.innerHTML=`<span><b>${m.graded}/${m.questions.length}</b> câu đã nhập đáp án</span>`+
  (m.difficult.length?`<span>Cần củng cố: ${m.difficult.map(q=>`<b>C${q.index}</b> (${q.counts.wrong}/${q.answered} sai)`).join(' · ')}</span>`:'<span>Chưa đủ dữ liệu để xếp câu cần củng cố.</span>');
 barEl.innerHTML=m.questions.map(qRow).join('')||'<p class="ri-empty">Đề chưa có câu hỏi.</p>';
 detail();
}
function clear(){state={signature:'',model:null,selected:null,filter:'wrong'};const b=document.getElementById('ri-chart');if(b)b.innerHTML='<p class="ri-empty">Chưa có đề để thống kê.</p>';const o=document.getElementById('ri-overview');if(o)o.textContent='';detail();}
function selectQuestion(i){if(!state.model)return;const q=state.model.questions.find(x=>x.index===i);if(!q)return;state.selected=i;state.filter=q.key?'wrong':'ungraded';
 const el=document.getElementById('ri-chart');if(el)el.innerHTML=state.model.questions.map(qRow).join('');detail();
 if(window.matchMedia&&window.matchMedia('(max-width: 850px)').matches)document.getElementById('ri-detail')?.scrollIntoView({behavior:'smooth',block:'start'});
}
if(typeof document!=='undefined')document.addEventListener('click',e=>{
 const q=e.target.closest('[data-ri-question]');if(q){selectQuestion(Number(q.dataset.riQuestion));return;}
 const filt=e.target.closest('[data-ri-filter]');if(filt){state.filter=filt.dataset.riFilter;detail();return;}
 if(e.target.closest('#ri-close')){state.selected=null;const el=document.getElementById('ri-chart');if(el&&state.model)el.innerHTML=state.model.questions.map(qRow).join('');detail();}
});
const api={analyze,render,clear,selectQuestion};
root.QR_REPORT_INSIGHTS=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?{}:window);
