import type { Portfolio } from './config';
// Figma interpolates the color and alpha stops separately. Dense intermediate
// CSS stops reproduce that appearance instead of a brighter premultiplied halo.
export function themeVariables(theme:Portfolio['theme']):Record<string,string> {
  const variables:Record<string,string>={};
  for(const [name,value] of Object.entries(theme.colors))variables[`--${name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`]=value;
  for(const [name,value] of Object.entries(theme.spacing))variables[`--${name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`]=`${value}px`;
  const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const colors=[rgb(theme.colors.glowInner),rgb(theme.colors.glowMid),rgb(theme.colors.background)];
  const stops=Array.from({length:41},(_,i)=>{
    const t=i/40,segment=t<=.55?0:1,u=segment===0?t/.55:(t-.55)/.45;
    const c=colors[segment].map((v,j)=>Math.round(v+(colors[segment+1][j]-v)*u));
    const alpha=segment===0?.76+(.32-.76)*u:.32*(1-u);
    return `rgba(${c.join(',')},${alpha.toFixed(4)}) ${t*100}%`;
  });
  variables['--hero-glow']=`radial-gradient(ellipse closest-side at center,${stops.join(',')})`;
  return variables;
}
