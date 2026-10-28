/* Quét thẻ lớp học V7.3 · ArUco multi-marker bridge (MIT-compatible glue).
   Detector: js-aruco2 2.0.0 (MIT) served from jsDelivr, cached by service worker.
   Physical marker IDs = class roster IDs 01..63. Do not silently guess orientation. */
(function(root){
 'use strict';
 let detector=null;
 const MIN_SIDE=22;
 const angleAnswer=(a,b)=>{
  const dx=b.x-a.x,dy=b.y-a.y;
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<MIN_SIDE)return null;
  const angle=Math.atan2(dy,dx);
  const directions=[{r:0,a:'A'},{r:-Math.PI/2,a:'B'},{r:Math.PI,a:'C'},{r:Math.PI/2,a:'D'}];
  const sorted=directions.map(x=>({answer:x.a,angle:Math.abs(Math.atan2(Math.sin(angle-x.r),Math.cos(angle-x.r)))})).sort((x,y)=>x.angle-y.angle);
  // Require within 34 degrees of card's cardinal direction: do not record rotated/in-motion cards.
  return sorted[0].angle <= 34*Math.PI/180 ? sorted[0].answer : null;
 };
 function available(){return !!(root.AR&&typeof root.AR.Detector==='function'&&typeof root.AR.Dictionary==='function')}
 function getDetector(){if(!available())throw Error('Chưa tải bộ nhận dạng ArUco. Hãy mở ứng dụng khi có Internet và tải lại trước khi thử ngoại tuyến.');
  if(!detector)detector=new root.AR.Detector({dictionaryName:'ARUCO'});return detector;}
 function normalize(raw,allowed){
  const id=Number(raw?.id),corners=raw?.corners;
  if(!Number.isInteger(id)||id<1||id>63||allowed&&!allowed.has(id))return null;
  if(!Array.isArray(corners)||corners.length!==4)return null;
  if(corners.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return null;
  const edges=corners.map((p,i)=>Math.hypot(p.x-corners[(i+1)%4].x,p.y-corners[(i+1)%4].y));
  if(Math.min(...edges)<MIN_SIDE)return null;
  if(Math.max(...edges)>5*Math.min(...edges))return null;
  const answer=angleAnswer(corners[0],corners[1]);
  return answer?{id,answer,corners,kind:'aruco'}:null;
 }
 function detect(imageData,allowed){
  const arr=getDetector().detect(imageData)||[];
  const out=new Map();
  for(const marker of arr){const hit=normalize(marker,allowed);if(hit&&!out.has(hit.id))out.set(hit.id,hit)}
  return [...out.values()];
 }
 function drawOverlay(canvas,context,hits,W,H){
  const rect=canvas.getBoundingClientRect();const ratio=Math.min(2,root.devicePixelRatio||1);
  const ow=Math.max(1,Math.round(rect.width*ratio)),oh=Math.max(1,Math.round(rect.height*ratio));
  if(canvas.width!==ow||canvas.height!==oh){canvas.width=ow;canvas.height=oh}
  context.clearRect(0,0,ow,oh);
  if(!hits?.length)return;
  const scale=Math.min(ow/W,oh/H),ox=(ow-W*scale)/2,oy=(oh-H*scale)/2;
  context.lineWidth=2.5*ratio;context.font=`bold ${13*ratio}px system-ui, sans-serif`;
  for(const h of hits){
   const corners=h.corners;if(!corners)continue;
   context.strokeStyle='#47f3a3';context.beginPath();corners.forEach((p,i)=>{const x=ox+p.x*scale,y=oy+p.y*scale;i?context.lineTo(x,y):context.moveTo(x,y)});context.closePath();context.stroke();
   const p=corners[0],x=Math.max(0,ox+p.x*scale),y=Math.max(20*ratio,oy+p.y*scale);
   const label=String(h.id).padStart(2,'0')+' · '+h.answer;
   context.fillStyle='rgba(5,35,46,.87)';context.fillRect(x,y-18*ratio,68*ratio,21*ratio);
   context.fillStyle='#fff';context.fillText(label,x+4*ratio,y-3*ratio);
  }
 }
 const api={available,detect,normalize,angleAnswer,drawOverlay};
 root.QR_ARUCO=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
