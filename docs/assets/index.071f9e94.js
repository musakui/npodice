let e;const t={},r=function(r,n){if(!n)return r();if(void 0===e){const t=document.createElement("link").relList;e=t&&t.supports&&t.supports("modulepreload")?"modulepreload":"preload"}return Promise.all(n.map((r=>{if(r in t)return;t[r]=!0;const n=r.endsWith(".css"),o=n?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${o}`))return;const s=document.createElement("link");return s.rel=n?"stylesheet":e,n||(s.as="script",s.crossOrigin=""),s.href=r,document.head.appendChild(s),n?new Promise(((e,t)=>{s.addEventListener("load",e),s.addEventListener("error",t)})):void 0}))).then((()=>r()))};const n=(e=1)=>(Math.random()-.5)*e,o=e=>new Promise((t=>setTimeout(t,e))),s=new Promise((async e=>{for(;!window.CANNON;)await o(100);e(window.CANNON)})),a=document.querySelector("header");document.querySelector(".ld"),r((()=>import("./babylon.86bef7cb.js").then((function(e){return e.au}))),void 0).then((async()=>{await Promise.all([r((()=>import("./scene.0b110e13.js").then((function(e){return e.s}))),["/npodice/assets/scene.0b110e13.js","/npodice/assets/babylon.86bef7cb.js"]).then((async({ready:e})=>{await e,a.style.backgroundColor="rgba(0,0,0,0)"})),s]),await r((()=>import("./app.c3a792ce.js")),["/npodice/assets/app.c3a792ce.js","/npodice/assets/app.4312e39c.css","/npodice/assets/babylon.86bef7cb.js","/npodice/assets/scene.0b110e13.js"])}));export{o as m,n as r};
