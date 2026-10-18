// Synthetic Bravado contract fixture; deliberately not a production showcase.
export function mountBravado(host,options){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 host.innerHTML='<section class="fixture-showcase"><div class="fixture-stage">Synthetic showcase</div><button type="button">Play showcase</button><button type="button" data-expand>Expand showcase</button><p>Fictional test content</p></section>';
 const root=host.firstElementChild,stage=root.querySelector('.fixture-stage'),play=root.querySelector('button');
 root.dataset.mode=options.displayMode;root.dataset.controls=String(options.controls);stage.style.aspectRatio=options.aspectRatio;
 play.disabled=reduced;
 let frame=0,playing=false,dialog;
 const tick=time=>{stage.style.backgroundColor=`hsl(${time/20%360} 30% 25%)`;frame=requestAnimationFrame(tick);};
 const toggle=()=>{playing=!playing;play.textContent=playing?'Pause showcase':'Play showcase';if(playing)frame=requestAnimationFrame(tick);else cancelAnimationFrame(frame);};
 const expand=()=>{dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Expanded synthetic showcase');dialog.innerHTML='<p>Expanded synthetic showcase</p><button>Close</button>';dialog.querySelector('button').onclick=()=>dialog.close();document.body.append(dialog);dialog.showModal();};
 play.addEventListener('click',toggle);root.querySelector('[data-expand]').addEventListener('click',expand);
 return {destroy(){cancelAnimationFrame(frame);play.removeEventListener('click',toggle);root.querySelector('[data-expand]').removeEventListener('click',expand);dialog?.remove();root.remove();}};
}
