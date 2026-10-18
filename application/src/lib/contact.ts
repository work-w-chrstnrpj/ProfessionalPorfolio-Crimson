import type {Portfolio} from './config';
export type ContactFields={name:string;email:string;inquiry:string;company:string;message:string;botcheck:string};
export type ContactResult='accepted'|'validation'|'unavailable'|'failed'|'timeout'|'quota';
export function validateContact(fields:ContactFields,config:Portfolio['contact']):string[]{
 const errors:string[]=[];
 if(!fields.name.trim()||fields.name.trim().length>100||/[\r\n]/.test(fields.name))errors.push('name');
 if(fields.email.length>254||!(/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fields.email.trim())))errors.push('email');
 if(!config.inquiries.some(i=>i.id===fields.inquiry))errors.push('inquiry');
 if(fields.company.length>100||/[\r\n]/.test(fields.company))errors.push('company');
 if(fields.message.trim().length<20||fields.message.length>5000)errors.push('message');
 if(fields.botcheck)errors.push('botcheck');
 return errors;
}
export async function submitContact(fields:ContactFields,config:Portfolio['contact'],key:string|undefined,captcha:string,fetcher:typeof fetch=fetch):Promise<ContactResult>{
 if(!config.enabled||!key?.trim())return 'unavailable';
 if(validateContact(fields,config).length||!captcha)return 'validation';
 const controller=new AbortController();
 let expired=false;
 const timer=setTimeout(()=>{expired=true;controller.abort();},config.timeoutMs);
 try{
  const response=await fetcher('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:key,name:fields.name.trim(),email:fields.email.trim(),inquiry_type:fields.inquiry,company:fields.company.trim(),message:fields.message.trim(),botcheck:false,'h-captcha-response':captcha}),signal:controller.signal});
  if(response.status===429)return 'quota';
  const body:unknown=await response.json();
  if(response.ok&&body&&typeof body==='object'&&'success'in body&&body.success===true)return 'accepted';
  return 'failed';
 }catch{return expired?'timeout':'failed';}
 finally{clearTimeout(timer);}
}
