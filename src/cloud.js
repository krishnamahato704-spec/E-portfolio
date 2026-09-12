import {config} from './config.js';
import {validateContent} from './content.js?v=recruiter-20260912';
const fileTypes=Object.freeze({pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'});
export async function request(path,options={}) {
  const {token,headers,timeoutMs=12000,...rest}=options;
  let response;
  try {
    response=await fetch(config.url+path,{...rest,headers:{apikey:config.key,...(token?{Authorization:`Bearer ${token}`}:{ }),...headers},signal:AbortSignal.timeout(timeoutMs)});
  } catch(error) {
    if(error?.name==='TimeoutError'||error?.name==='AbortError') throw new Error('The request took too long. Check your connection and try again.');
    throw error;
  }
  if(!response.ok) {
    let data={}; try{data=await response.json()}catch{}
    throw new Error(response.status===401?'Your session has expired. Please sign in again.':data.msg||data.message||data.error_description||`Request failed (${response.status}). Please try again.`);
  }
  if(response.status===204)return null;
  if(typeof response.text!=='function')return response.json();
  const text=await response.text();
  return text?JSON.parse(text):null;
}
export async function loadContent() {
  const rows=await request('/rest/v1/portfolio_public?id=eq.1&select=content,updated_at');
  if(!rows?.[0]?.content) throw new Error('Online content is unavailable.');
  return rows[0];
}
export async function signIn(email,password) {
  const result=await request('/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  if(result.user?.id!==config.ownerId) {await signOut(result.access_token);throw new Error('This account does not have portfolio editing access.');}
  return result;
}
export async function signOut(token) {return request('/auth/v1/logout',{method:'POST',token});}
export async function saveContent(content,token,version) {
  validateContent(content);
  if(!version) throw new Error('Load the latest online version before publishing.');
  const rows=await request('/rest/v1/portfolio_public?id=eq.1&updated_at=eq.'+encodeURIComponent(version),{method:'PATCH',token,headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({content,updated_at:new Date().toISOString(),updated_by:config.ownerId})});
  if(!rows?.length) throw new Error('The online content changed, or access was denied. Export your draft, then reload before publishing.');
  return rows[0];
}
export function validateFile(file) {
  const ext=file.name.split('.').pop().toLowerCase();
  const reportedType=(file.type||'').toLowerCase();
  const genericType=!reportedType||reportedType==='application/octet-stream';
  if(!fileTypes[ext] || (!genericType&&fileTypes[ext]!==reportedType)) throw new Error('Choose a PDF, JPG, PNG, WebP, Word (.docx) or PowerPoint (.pptx) file.');
  if(!file.size || file.size>10*1024*1024) throw new Error('Files must be between 1 byte and 10 MB.');
  return ext;
}
export async function uploadFile(file,token) {
  const ext=validateFile(file);
  const path=`redesign/${crypto.randomUUID()}.${ext}`;
  await request('/storage/v1/object/portfolio-media/'+path,{method:'POST',token,timeoutMs:90000,headers:{'Content-Type':fileTypes[ext],'x-upsert':'false'},body:file});
  return `${config.url}/storage/v1/object/public/portfolio-media/${path}`;
}
