const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../nodes/0.-AHuM6ds.js","../chunks/disclose-version.9rZ0KkiL.js","../chunks/custom-element.FTHV4Kua.js","../chunks/props.qJm2mpZK.js","../nodes/1.NLGKRpy2.js","../chunks/legacy.CBrKHt9J.js","../chunks/entry.6erwwHt7.js","../nodes/2.C0srCHJ1.js","../chunks/index-client.BLSNn1Xa.js"])))=>i.map(i=>d[i]);
import{_ as F,a4 as Y,V as z,W as G,X as H,$ as Q,a3 as Z,aa as M,ab as $,x as tt,ac as et,S as rt,c as at,p as st,J as nt,K as ot,m as g,k as T,ad as it,f as S,a0 as A,a as P,s as ct,e as lt,ae as ut,t as ft,r as dt,b as mt,a1 as p,d as j,af as L,g as _t,C,ag as ht}from"../chunks/custom-element.FTHV4Kua.js";import"../chunks/disclose-version.9rZ0KkiL.js";import{o as gt,i as O}from"../chunks/index-client.BLSNn1Xa.js";import{p as v,a as pt}from"../chunks/props.qJm2mpZK.js";function B(s,e,o){F&&Y();var l=s,a,t;z(()=>{a!==(a=e())&&(t&&(Z(t),t=null),a&&(t=H(()=>o(l,a))))},G),F&&(l=Q)}function U(s,e){return s===e||(s==null?void 0:s[rt])===e}function V(s={},e,o,l){return M(()=>{var a,t;return $(()=>{a=t,t=[],tt(()=>{s!==o(...t)&&(e(s,...t),a&&U(o(...a),s)&&e(null,...a))})}),()=>{et(()=>{t&&U(o(...t),s)&&e(null,...t)})}}),s}const vt="modulepreload",Et=function(s,e){return new URL(s,e).href},W={},q=function(e,o,l){let a=Promise.resolve();if(o&&o.length>0){const i=document.getElementsByTagName("link"),n=document.querySelector("meta[property=csp-nonce]"),h=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));a=Promise.allSettled(o.map(c=>{if(c=Et(c,l),c in W)return;W[c]=!0;const m=c.endsWith(".css"),w=m?'[rel="stylesheet"]':"";if(!!l)for(let _=i.length-1;_>=0;_--){const E=i[_];if(E.href===c&&(!m||E.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${c}"]${w}`))return;const u=document.createElement("link");if(u.rel=m?"stylesheet":vt,m||(u.as="script"),u.crossOrigin="",u.href=c,h&&u.setAttribute("nonce",h),document.head.appendChild(u),m)return new Promise((_,E)=>{u.addEventListener("load",_),u.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${c}`)))})}))}function t(i){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=i,window.dispatchEvent(n),!n.defaultPrevented)throw i}return a.then(i=>{for(const n of i||[])n.status==="rejected"&&t(n.reason);return e().catch(t)})},xt={};var yt=j('<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>'),Pt=j("<!> <!>",1);function J(s,e){st(e,!0);let o=v(e,"stores",7),l=v(e,"page",7),a=v(e,"constructors",7),t=v(e,"components",23,()=>[]),i=v(e,"form",7),n=v(e,"data_0",7,null),h=v(e,"data_1",7,null);nt(()=>o().page.set(l())),ot(()=>{o(),l(),a(),t(),i(),n(),h(),o().page.notify()});let c=L(!1),m=L(!1),w=L(null);gt(()=>{const r=o().page.subscribe(()=>{g(c)&&(T(m,!0),it().then(()=>{T(w,pt(document.title||"untitled page"))}))});return T(c,!0),r});const D=C(()=>a()[1]);var u=Pt(),_=S(u);O(_,()=>a()[1],r=>{var d=A();const k=C(()=>a()[0]);var b=S(d);B(b,()=>g(k),(y,x)=>{V(x(y,{get data(){return n()},get form(){return i()},children:(f,kt)=>{var I=A(),K=S(I);B(K,()=>g(D),(N,X)=>{V(X(N,{get data(){return h()},get form(){return i()}}),R=>t()[1]=R,()=>{var R;return(R=t())==null?void 0:R[1]})}),P(f,I)},$$slots:{default:!0}}),f=>t()[0]=f,()=>{var f;return(f=t())==null?void 0:f[0]})}),P(r,d)},r=>{var d=A();const k=C(()=>a()[0]);var b=S(d);B(b,()=>g(k),(y,x)=>{V(x(y,{get data(){return n()},get form(){return i()}}),f=>t()[0]=f,()=>{var f;return(f=t())==null?void 0:f[0]})}),P(r,d)});var E=ct(_,2);return O(E,()=>g(c),r=>{var d=yt(),k=lt(d);O(k,()=>g(m),b=>{var y=ut();ft(()=>_t(y,g(w))),P(b,y)}),dt(d),P(r,d)}),P(s,u),mt({get stores(){return o()},set stores(r){o(r),p()},get page(){return l()},set page(r){l(r),p()},get constructors(){return a()},set constructors(r){a(r),p()},get components(){return t()},set components(r=[]){t(r),p()},get form(){return i()},set form(r){i(r),p()},get data_0(){return n()},set data_0(r=null){n(r),p()},get data_1(){return h()},set data_1(r=null){h(r),p()}})}at(J,{stores:{},page:{},constructors:{},components:{},form:{},data_0:{},data_1:{}},[],[],!0);const Tt=ht(J),At=[()=>q(()=>import("../nodes/0.-AHuM6ds.js"),__vite__mapDeps([0,1,2,3]),import.meta.url),()=>q(()=>import("../nodes/1.NLGKRpy2.js"),__vite__mapDeps([4,1,2,5,6]),import.meta.url),()=>q(()=>import("../nodes/2.C0srCHJ1.js"),__vite__mapDeps([7,1,2,5,8,3]),import.meta.url)],Lt=[],Ct={"/":[2]},Ot={handleError:({error:s})=>{console.error(s)},reroute:()=>{}};export{Ct as dictionary,Ot as hooks,xt as matchers,At as nodes,Tt as root,Lt as server_loads};