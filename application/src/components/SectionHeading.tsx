export function SectionHeading({copy}:{copy:{kicker:string;title:string;lead?:string}}){
  return <div className="section-heading"><p className="section-kicker">{copy.kicker}</p><h2>{copy.title}</h2></div>;
}
export function SystemMotif({className=''}:{className?:string}){
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="2"><path d="m120 20 90 50v100l-90 50-90-50V70Zm0 0v100m-90-50 90 50 90-50m-90 50v100M60 88v65l60 34 60-34V88M75 96v49l45 25 45-25V96"/></g></svg>;
}
