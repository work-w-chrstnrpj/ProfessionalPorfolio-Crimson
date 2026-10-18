'use client';
import {useRef,useState,useEffect,type FormEvent} from 'react';
import dynamic from 'next/dynamic';
import type {Portfolio} from '../lib/config';
import {submitContact,validateContact,type ContactResult,type ContactFields} from '../lib/contact';
import {ArrowIcon} from './primitives';
const HCaptcha=dynamic(()=>import('@hcaptcha/react-hcaptcha'),{ssr:false});
export function ContactForm({config,accessKey}:{config:Portfolio['contact'];accessKey?:string}){
 const [pending,setPending]=useState(false),[result,setResult]=useState<ContactResult|null>(null),[errors,setErrors]=useState<string[]>([]),[captcha,setCaptcha]=useState('');
 const busy=useRef(false);
 const [captchaVersion,setCaptchaVersion]=useState(0);
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 const active=config.enabled&&!!accessKey?.trim();
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy.current)return;
  const form=event.currentTarget,data=new FormData(form);
  const fields=Object.fromEntries(['name','email','inquiry','company','message','botcheck'].map(k=>[k,String(data.get(k)||'')])) as ContactFields;
  if(!active){setResult('unavailable');return;}
  const invalid=validateContact(fields,config);setErrors(invalid);
  if(invalid.length||!captcha){setResult('validation');form.querySelector<HTMLElement>(`[name="${invalid[0]||'name'}"]`)?.focus();return;}
  busy.current=true;setPending(true);setResult(null);
  try{const outcome=await submitContact(fields,config,accessKey,captcha);setResult(outcome);if(outcome==='accepted'){form.reset();setErrors([]);}}
  finally{busy.current=false;setPending(false);setCaptcha('');setCaptchaVersion(v=>v+1);}
 }
 function fieldError(name:string){return errors.includes(name);}
 return <form className="contact-form" onSubmit={submit} noValidate aria-busy={pending}>
  <div className="contact-field"><label htmlFor="contact-name">{config.labels.name}</label><input disabled={pending} id="contact-name" name="name" autoComplete="name" maxLength={100} required aria-invalid={fieldError('name')}/></div>
  <div className="contact-field"><label htmlFor="contact-email">{config.labels.email}</label><input disabled={pending} id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required aria-invalid={fieldError('email')}/></div>
  <div className="contact-field"><label htmlFor="contact-inquiry">{config.labels.inquiry}</label><div className="select-wrap"><select disabled={pending} id="contact-inquiry" name="inquiry" defaultValue="" required aria-invalid={fieldError('inquiry')}><option value="" disabled>{config.labels.select}</option>{config.inquiries.map(i=><option key={i.id} value={i.id}>{i.label}</option>)}</select><ArrowIcon down/></div></div>
  <div className="contact-field"><label htmlFor="contact-company">{config.labels.company}</label><input disabled={pending} id="contact-company" name="company" autoComplete="organization" maxLength={100} aria-invalid={fieldError('company')}/></div>
  <div className="contact-field contact-message"><label htmlFor="contact-message">{config.labels.message}</label><textarea disabled={pending} id="contact-message" name="message" minLength={20} maxLength={5000} required aria-invalid={fieldError('message')}/></div>
  <input className="honeypot" type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
  {active&&<div className="captcha-slot"><HCaptcha key={captchaVersion} sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" reCaptchaCompat={false} theme="dark" onVerify={setCaptcha} onExpire={()=>setCaptcha('')} onError={()=>{setCaptcha('');setResult('failed');}}/></div>}
  <button className="action contact-submit" type="submit" disabled={!ready||pending}>{pending?config.messages.sending:config.labels.submit}<ArrowIcon/></button>
  <noscript><p className="form-no-script">{config.messages.unavailable}</p></noscript>
  <p className="form-privacy">{config.messages.privacy}</p>
  <p className="form-status" data-state={pending?'sending':result||undefined} role="status" aria-live="polite">{pending?config.messages.sending:result?config.messages[result]:''}</p>
 </form>;
}
