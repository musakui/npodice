import{E as e,S as r,C as t,A as n,V as o}from"./vendor.ee3a7cf6.js";let s;const i={},a=function(e,r){if(!r)return e();if(void 0===s){const e=document.createElement("link").relList;s=e&&e.supports&&e.supports("modulepreload")?"modulepreload":"preload"}return Promise.all(r.map((e=>{if(e in i)return;i[e]=!0;const r=e.endsWith(".css"),t=r?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${e}"]${t}`))return;const n=document.createElement("link");return n.rel=r?"stylesheet":s,r||(n.as="script",n.crossOrigin=""),n.href=e,document.head.appendChild(n),r?new Promise(((e,r)=>{n.addEventListener("load",e),n.addEventListener("error",r)})):void 0}))).then((()=>e()))},d=document.createElement("canvas"),l=new e(d,!0,{preserveDrawingBuffer:!0,stencil:!0}),c=new r(l);c.clearColor=t.Black(),c.fogColor=t.Black(),c.fogMode=r.FOGMODE_EXP,c.fogDensity=.02;const u=new n("camera",Math.PI/6,Math.PI/3,25,o.Zero());u.wheelPrecision=10,u.upperBetaLimit=1.4,u.lowerRadiusLimit=3,u.upperRadiusLimit=45,u.attachControl(d,!0),document.body.appendChild(d),l.resize(),l.runRenderLoop((()=>c.render())),window.addEventListener("resize",(()=>l.resize())),a((()=>import("./app.7ae5b289.js").then((function(e){return e.f}))),["/npodice/assets/app.7ae5b289.js","/npodice/assets/vendor.ee3a7cf6.js"]).then((e=>e.init(c)));export{a as _,u as c,c as s};