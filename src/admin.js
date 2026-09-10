import {loadContent,signIn,signOut,saveContent,uploadFile,validateFile} from './cloud.js';
import {mergeContent,validateContent} from './content.js';
import {esc,view} from './views.js';
let session=null, draft=null, version=null, dirty=false, base='./',busy=false;
const schemas={
 qualifications:{label:'Education',fields:{title:'Qualification',place:'Institution / result',period:'Study period',status:'Status',expected:'Expected completion (optional)',note:'Progress note (optional)'}},
 experiences:{label:'Teaching experiences',fields:{title:'Experience title',type:'Type / duration',period:'Dates',points:'Activities (one per line)'}},
 practice:{label:'Teaching approach',fields:{title:'Principle',text:'Description'}},
 certificates:{label:'Credentials',fields:{title:'Certificate title',issuer:'Issuing organisation',date:'Date',category:'Category',description:'Description',image:'Certificate image URL'}},
 resources:{label:'Teaching resources',fields:{title:'File title',category:'Category',description:'Description',url:'File URL'}},
 gallery:{label:'Gallery',fields:{title:'Caption / alternative text',image:'Image URL'}},
};
const profileFields={availability:'Earliest joining availability',eligibility:'Eligibility exam status',name:'Full name',email:'Contact email',eyebrow:'Profile label',headline:'Main statement',summary:'Professional summary',roles:'Roles of interest (one per line)',subjects:'Subjects (one per line)',languages:'Languages (one per line)',portrait:'Portrait URL',cv:'CV PDF URL (optional)'};
const multiline=new Set(['headline','summary','roles','subjects','languages','about','preparation','competencies','points','description','text']);
const categories={certificates:['Academic','Teaching','Professional learning','Presentation'],resources:['Lesson plan','Teaching material','Assessment','Presentation']};
function draftTarget(scope,index){return scope==='root'?draft:scope==='profile'?draft.profile:draft[scope][Number(index)];}
function field(key,label,value,scope,index){
 const attrs=`data-field="${key}" data-scope="${scope}" ${index!==undefined?`data-index="${index}"`:''}`;
 const text=Array.isArray(value)?value.join('\n'):value||'';
 let input;
 if(key==='category'&&categories[scope]) input=`<select ${attrs}>${categories[scope].map(v=>`<option ${v===value?'selected':''}>${v}</option>`).join('')}</select>`;
 else if(key==='status')input=`<select ${attrs}><option ${value==='Completed'?'selected':''}>Completed</option><option ${value==='In progress'?'selected':''}>In progress</option></select>`;
 else if(multiline.has(key))input=`<textarea ${attrs} rows="3" maxlength="5000">${esc(text)}</textarea>`;
 else input=`<input ${attrs} value="${esc(text)}" type="${key==='email'?'email':['image','url','portrait','cv'].includes(key)?'url':'text'}" maxlength="1000">`;
 return `<label>${label}${input}</label>`;
}
function uploadControl(scope,index,key){return `<label class="upload-control">Upload ${key==='cv'?'CV (PDF)':key==='url'?'a file':'an image'}<input type="file" data-upload="${key}" data-scope="${scope}" ${index!==undefined?`data-index="${index}"`:''} accept="${key==='cv'?'.pdf':key==='url'?'.pdf,.docx,.pptx,.jpg,.jpeg,.png,.webp':'.jpg,.jpeg,.png,.webp'}"><small>Maximum 10 MB. Uploaded files are publicly accessible.</small></label>`;}
function editor(){
 document.querySelector('#studio').innerHTML=`<div class="studio-toolbar"><button class="button light" id="preview">Preview changes</button><button class="button light" id="publish">Publish changes</button><button class="button light" id="export">Export draft</button><button class="button light" id="logout">Sign out</button></div><p class="studio-message" id="studio-status" role="status">Loaded the current online content. No changes published.</p><p class="admin-note">Edit text and attach files below. Removing a file here removes its reference; the stored file is retained. Export a draft before leaving if you want to keep unpublished changes.</p><details class="editor-section" open><summary>Profile & contact</summary><div class="editor-fields">${Object.entries(profileFields).map(([k,l])=>field(k,l,draft.profile[k],'profile')).join('')}${uploadControl('profile',undefined,'portrait')}${uploadControl('profile',undefined,'cv')}</div></details><details class="editor-section"><summary>About & skills</summary><div class="editor-fields">${[['about','About me'],['preparation','Additional preparation'],['competencies','Skills (one per line)']].map(([k,l])=>field(k,l,draft[k],'root')).join('')}</div></details>${Object.entries(schemas).map(([scope,s])=>`<details class="editor-section"><summary>${s.label} (${draft[scope].length})</summary>${draft[scope].map((item,i)=>`<div class="editor-item"><h3>${esc(item.title||'New entry')}</h3><div class="editor-fields">${Object.entries(s.fields).map(([k,l])=>field(k,l,item[k],scope,i)).join('')}${['certificates','gallery','resources'].includes(scope)?uploadControl(scope,i,scope==='resources'?'url':'image'):''}</div><button class="button danger" data-remove="${scope}" data-index="${i}">Remove entry</button></div>`).join('')}<button class="button secondary" data-add="${scope}">Add ${s.label.toLowerCase()} entry</button></details>`).join('')}<details class="editor-section"><summary>Restore an exported draft</summary><p class="admin-note">Restoring replaces this workspace draft. It does not publish automatically.</p><label>Draft JSON file<input type="file" id="import-draft" accept=".json,application/json"></label></details><dialog class="preview-dialog" aria-label="Preview unpublished portfolio"><div class="dialog-toolbar"><label>Page<select id="preview-route"><option value="home">Home</option><option value="profile">Profile</option><option value="teaching">Teaching</option><option value="resources">Resources</option><option value="credentials">Credentials</option><option value="resume">Résumé</option><option value="contact">Contact</option></select></label><span>Unpublished preview</span><button class="button light" id="close-preview">Close preview</button></div><div id="preview-content"></div></dialog>`;
 document.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('input',()=>{
  const {scope,field:key,index}=el.dataset;const target=draftTarget(scope,index);
  target[key]=['roles','subjects','languages','competencies','points'].includes(key)?el.value.split('\n').map(x=>x.trim()).filter(Boolean):el.value;
  setDirty();
 }));
 document.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>{
  const scope=el.dataset.add;draft[scope].push(Object.assign({id:crypto.randomUUID()},Object.fromEntries(Object.keys(schemas[scope].fields).map(k=>[k,k==='points'?[]:k==='category'?categories[scope][0]:k==='status'?'In progress':'']))));setDirty();editor();
  const group=[...document.querySelectorAll('.editor-section')].find(x=>x.querySelector(`[data-add="${scope}"]`));group.open=true;group.querySelectorAll('.editor-item').item(draft[scope].length-1).querySelector('input,textarea,select').focus();status('Entry added to the draft.');
 }));
 document.querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click',()=>{if(confirm('Remove this entry from the draft? Stored files will be retained.')){draft[el.dataset.remove].splice(Number(el.dataset.index),1);setDirty();editor();status('Entry removed from the draft. Publish to apply.')}}));
 document.querySelectorAll('[data-upload]').forEach(el=>el.addEventListener('change',async()=>{
  const file=el.files[0];if(!file)return;
  try{
   validateFile(file);
   if(el.dataset.upload==='cv' && file.type!=='application/pdf')throw new Error('The CV must be a PDF.');
   if(['image','portrait'].includes(el.dataset.upload) && !file.type.startsWith('image/'))throw new Error('Choose an image for this field.');
   setBusy(true);status('Uploading file…');
   const url=await uploadFile(file,session.access_token);
   draftTarget(el.dataset.scope,el.dataset.index)[el.dataset.upload]=url;setDirty();editor();status('File uploaded. Preview, then publish to display it on the portfolio.');
  }catch(err){status(err.message)}finally{setBusy(false);el.value=''}
 }));
 document.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='krishna-portfolio-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);status('Draft exported. This does not publish your changes.');};
 document.querySelector('#import-draft').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>500000)throw new Error('Draft is too large.');const next=validateContent(JSON.parse(await file.text()));if(confirm('Replace the current workspace draft with this file?')){draft=next;setDirty();editor();status('Draft restored. Preview before publishing.')}}catch(err){status(err.message)}};
 document.querySelector('#preview').onclick=()=>{const dlg=document.querySelector('dialog');document.querySelector('#preview-content').innerHTML=view('home',draft,base);document.querySelector('#preview-route').value='home';dlg.showModal();};
 document.querySelector('#preview-route').onchange=e=>document.querySelector('#preview-content').innerHTML=view(e.target.value,draft,base);
 document.querySelector('#close-preview').onclick=()=>document.querySelector('dialog').close();
 document.querySelector('#preview-content').onclick=e=>{if(e.target.closest('a,button,form'))e.preventDefault()};
 document.querySelector('#publish').onclick=async()=>{
  try{validateContent(draft);if(!confirm('Publish this draft to your public portfolio?'))return;setBusy(true);status('Publishing…');draft.schemaVersion=3;const row=await saveContent(draft,session.access_token,version);version=row.updated_at;dirty=false;status('Published successfully. Your portfolio now shows this content.');}
  catch(err){status(err.message)}finally{setBusy(false)}
 };
 document.querySelector('#logout').onclick=async()=>{if(dirty&&!confirm('Discard unpublished changes and sign out? Export first if you want to keep them.'))return;try{await signOut(session.access_token)}catch{}session=null;draft=null;dirty=false;location.reload()};
}
function status(text){const el=document.querySelector('#studio-status')||document.querySelector('#login-status');if(el)el.textContent=text;}
function setDirty(){dirty=true;status('Unpublished changes. Preview before publishing.');}
function setBusy(value){busy=value;document.querySelectorAll('#studio button,#studio input,#studio textarea,#studio select').forEach(el=>el.disabled=value)}
export function initStudio(rootBase){
 base=rootBase;
 document.querySelector('#login-form').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget;const fields=new FormData(form);const button=form.querySelector('button');button.disabled=true;status('Signing in…');
  try{session=await signIn(String(fields.get('email')),String(fields.get('password')));form.reset();const row=await loadContent();draft=mergeContent(row.content);version=row.updated_at;editor();}
  catch(err){status(err.message);button.disabled=false;form.elements.password.value='';session=null;}
 });
 window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});
}
