// Progressive search/filter controls. All evidence is readable before JS runs.
export function wireCollections(root=document) {
  const groups=[
    {list:'resource-list',row:'.resource-row',input:'resource-search',attribute:'data-filter',count:'resource-count',empty:'resource-empty',noun:'files'},
    {list:'experience-list',row:'.experience-row',input:'experience-search',attribute:'data-experience-filter',count:'experience-count',empty:'experience-empty',noun:'experiences'},
    {list:'credential-list',row:'.certificate-card',input:'credential-search',attribute:'data-credential-filter',count:'credential-count',empty:'credential-empty',noun:'credentials'},
  ];
  for(const group of groups){
    const list=root.querySelector('#'+group.list);
    if(!list)continue;
    const rows=[...list.querySelectorAll(group.row)];
    const input=root.querySelector('#'+group.input);
    const buttons=[...root.querySelectorAll('['+group.attribute+']')];
    const count=root.querySelector('#'+group.count);
    const empty=root.querySelector('#'+group.empty);
    let category='All';
    const text=new Map(rows.map(row=>[row,row.textContent.toLocaleLowerCase()]));
    const update=()=>{
      const terms=(input?.value||'').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let shown=0;
      for(const row of rows){
        row.hidden=(category!=='All'&&row.dataset.category!==category)||!terms.every(term=>text.get(row).includes(term));
        if(!row.hidden)shown++;
      }
      if(count)count.textContent=`${shown} of ${rows.length} ${group.noun} shown`;
      if(empty){
        empty.hidden=shown>0;
        if(rows.length)empty.textContent=`No ${group.noun} match. Try another category or clear the search.`;
      }
    };
    input?.addEventListener('input',update);
    for(const button of buttons)button.addEventListener('click',()=>{
      category=button.getAttribute(group.attribute);
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      update();
    });
    update();
  }
  root.querySelectorAll('[data-enhancement]').forEach(el=>el.hidden=false);
}
