(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))l(r);new MutationObserver(r=>{for(const c of r)if(c.type==="childList")for(const s of c.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&l(s)}).observe(document,{childList:!0,subtree:!0});function n(r){const c={};return r.integrity&&(c.integrity=r.integrity),r.referrerpolicy&&(c.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?c.credentials="include":r.crossorigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function l(r){if(r.ep)return;r.ep=!0;const c=n(r);fetch(r.href,c)}})();function m(){}function S(e){return e()}function j(){return Object.create(null)}function b(e){e.forEach(S)}function q(e){return typeof e=="function"}function M(e,t){return e!=e?t==t:e!==t||e&&typeof e=="object"||typeof e=="function"}let y;function F(e,t){return y||(y=document.createElement("a")),y.href=t,e===y.href}function K(e){return Object.keys(e).length===0}function a(e,t){e.appendChild(t)}function T(e,t,n){e.insertBefore(t,n||null)}function B(e){e.parentNode&&e.parentNode.removeChild(e)}function p(e){return document.createElement(e)}function V(e){return document.createTextNode(e)}function C(){return V(" ")}function u(e,t,n){n==null?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function z(e){return Array.from(e.childNodes)}let E;function _(e){E=e}const g=[],L=[],$=[],P=[],D=Promise.resolve();let k=!1;function G(){k||(k=!0,D.then(I))}function v(e){$.push(e)}const w=new Set;let x=0;function I(){const e=E;do{for(;x<g.length;){const t=g[x];x++,_(t),H(t.$$)}for(_(null),g.length=0,x=0;L.length;)L.pop()();for(let t=0;t<$.length;t+=1){const n=$[t];w.has(n)||(w.add(n),n())}$.length=0}while(g.length);for(;P.length;)P.pop()();k=!1,w.clear(),_(e)}function H(e){if(e.fragment!==null){e.update(),b(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(v)}}const J=new Set;function Q(e,t){e&&e.i&&(J.delete(e),e.i(t))}function R(e,t,n,l){const{fragment:r,after_update:c}=e.$$;r&&r.m(t,n),l||v(()=>{const s=e.$$.on_mount.map(S).filter(q);e.$$.on_destroy?e.$$.on_destroy.push(...s):b(s),e.$$.on_mount=[]}),c.forEach(v)}function U(e,t){const n=e.$$;n.fragment!==null&&(b(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function W(e,t){e.$$.dirty[0]===-1&&(g.push(e),G(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function X(e,t,n,l,r,c,s,d=[-1]){const f=E;_(e);const o=e.$$={fragment:null,ctx:[],props:c,update:m,not_equal:r,bound:j(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(f?f.$$.context:[])),callbacks:j(),dirty:d,skip_bound:!1,root:t.target||f.$$.root};s&&s(o.root);let h=!1;if(o.ctx=n?n(e,t.props||{},(i,O,...N)=>{const A=N.length?N[0]:O;return o.ctx&&r(o.ctx[i],o.ctx[i]=A)&&(!o.skip_bound&&o.bound[i]&&o.bound[i](A),h&&W(e,i)),O}):[],o.update(),h=!0,b(o.before_update),o.fragment=l?l(o.ctx):!1,t.target){if(t.hydrate){const i=z(t.target);o.fragment&&o.fragment.l(i),i.forEach(B)}else o.fragment&&o.fragment.c();t.intro&&Q(e.$$.fragment),R(e,t.target,t.anchor,t.customElement),I()}_(f)}class Y{$destroy(){U(this,1),this.$destroy=m}$on(t,n){if(!q(n))return m;const l=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return l.push(n),()=>{const r=l.indexOf(n);r!==-1&&l.splice(r,1)}}$set(t){this.$$set&&!K(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Z="/thorchain-proof-of-vaults/assets/logo.3df51d67.png";function ee(e){let t,n,l,r,c,s,d,f,o;return{c(){t=p("main"),n=p("div"),l=p("div"),r=p("img"),s=C(),d=p("h1"),d.textContent="Proof Of Vaults",f=C(),o=p("p"),o.textContent="coming soon",F(r.src,c=Z)||u(r,"src",c),u(r,"class","max-w-full rounded-full w-[50px] h-[50px] border-4 border-black"),u(r,"alt",""),u(l,"class","flex justify-center mb-5"),u(d,"class","text-2xl text-center uppercase"),u(o,"class","text-lg text-center uppercase text-gray-300"),u(n,"class","container bg-white flex flex-col p-10 md:p-20 shadow-md h-full"),u(t,"class","flex flex-col bg-gray-100 h-screen p-10 md:p-20")},m(h,i){T(h,t,i),a(t,n),a(n,l),a(l,r),a(n,s),a(n,d),a(n,f),a(n,o)},p:m,i:m,o:m,d(h){h&&B(t)}}}class te extends Y{constructor(t){super(),X(this,t,null,ee,M,{})}}new te({target:document.getElementById("app")});
