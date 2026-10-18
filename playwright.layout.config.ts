import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:'**/navigation-layout.spec.ts',projects:[
 {name:'chrome',use:{browserName:'chromium',channel:'chrome'}},
 {name:'webkit',use:{browserName:'webkit'}},
]});
