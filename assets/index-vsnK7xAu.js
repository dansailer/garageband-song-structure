(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`Add a new Software Instrument track (+ in the header).`,`Select Synthesizer → Plucked → Future Rave Pluck in the Library.`,`Download and import the .mid file (File → Import → MIDI File).`,`Drag the imported MIDI region onto the Future Rave Pluck track.`],t=[{id:`pluck`,label:`Future Rave Pluck (recommended)`,mode:`melodic`,channel:0,program:25,note:79,accentNote:84,velocity:127,accentVelocity:127,garageBandKit:`Synthesizer → Plucked → Future Rave Pluck`,description:`Bright, short pluck — clearly audible and works well as a click.`},{id:`woodblock`,label:`Wood Block`,mode:`drum`,channel:9,note:76,accentNote:77,velocity:127,accentVelocity:127,garageBandKit:`Drum Kit → Wood Blocks`,description:`Classic metronome wood block on a drum kit track.`},{id:`sidestick`,label:`Side Stick`,mode:`drum`,channel:9,note:37,accentNote:37,velocity:110,accentVelocity:127,garageBandKit:`Drum Kit → SoCal (or any kit)`,description:`Sharp rim/side-stick hit on a drum kit track.`},{id:`snare`,label:`Snare`,mode:`drum`,channel:9,note:38,accentNote:52,velocity:100,accentVelocity:127,garageBandKit:`Drum Kit → SoCal (or any kit)`,description:`Loud snare on downbeats on a drum kit track.`},{id:`hihat`,label:`Hi-Hat`,mode:`drum`,channel:9,note:42,accentNote:44,velocity:110,accentVelocity:127,garageBandKit:`Drum Kit → SoCal (or any kit)`,description:`Closed hi-hat on a drum kit track.`},{id:`cowbell`,label:`Cowbell`,mode:`drum`,channel:9,note:56,accentNote:56,velocity:110,accentVelocity:127,garageBandKit:`Drum Kit → SoCal (or any kit)`,description:`Bright cowbell on a drum kit track.`}];function n(e){return t.find(t=>t.id===e)??t[0]}function r(e,t){return 4/t*e}function i(e){return e.bars*r(e.numerator,e.denominator)*(60/e.tempo)}function a(e,t=480){let n=e.bars*r(e.numerator,e.denominator);return Math.round(n*t)}function o(e){return e.reduce((e,t)=>e+t.bars,0)}function s(e){return e.reduce((e,t)=>e+i(t),0)}function c(e){return`${Math.floor(e/60)}:${Math.round(e%60).toString().padStart(2,`0`)}`}var l=48;function u(e,t,n){return[144|e,t,n]}function d(e,t){return[128|e,t,0]}function f(e,t){let n=Array.from(new TextEncoder().encode(t));return[255,e,n.length,...n]}function p(e,t,n){return[176|e,t,n]}function m(e,t){return[192|e,t]}function h(e,t){return t===8&&e>=6&&e%3==0}function g(e,t,n=480){if(t===8){let r=n/2,i=h(e,t);return Array.from({length:e},(e,t)=>({tickOffset:Math.round(t*r),accent:i?t%3==0:t===0}))}let i=r(e,t);return Array.from({length:i},(e,t)=>({tickOffset:t*n,accent:t===0}))}function _(e){let t=[{tick:0,data:f(3,`Click`)},{tick:0,data:f(4,e.label)}];return e.mode===`melodic`&&e.program!==void 0&&t.push({tick:0,data:p(e.channel,0,0)},{tick:0,data:p(e.channel,32,0)},{tick:0,data:m(e.channel,e.program)}),t}function v(e,t,n){let i=[],a=g(e.numerator,e.denominator),o=Math.round(r(e.numerator,e.denominator)*480);for(let r=0;r<e.bars;r+=1)for(let e of a){let a=t+r*o+e.tickOffset,s=e.accent?n.accentNote:n.note,c=e.accent?n.accentVelocity:n.velocity;i.push({tick:a,data:u(n.channel,s,c)}),i.push({tick:a+l,data:d(n.channel,s)})}return i}function y(e,t,i){let a=n(i),o=0;for(let n of t){e.push(...v(n,o,a));let t=r(n.numerator,n.denominator);o+=Math.round(n.bars*t*480)}}var b=new TextEncoder().encode(`MThd`),ee=new TextEncoder().encode(`MTrk`);function x(e){let t=new Uint8Array(4);return t[0]=e>>24&255,t[1]=e>>16&255,t[2]=e>>8&255,t[3]=e&255,t}function S(e){let t=new Uint8Array(2);return t[0]=e>>8&255,t[1]=e&255,t}function C(e){if(e<0)throw Error(`VLQ value must be non-negative`);if(e===0)return[0];let t=[],n=e;for(;n>0;)t.unshift(n&127),n>>=7;for(let e=0;e<t.length-1;e+=1)t[e]|=128;return t}function w(e){return Math.log2(e)}function T(e){let t=Math.round(6e7/e);return[255,81,3,t>>16&255,t>>8&255,t&255]}function E(e,t){return[255,88,4,e,w(t),24,8]}function D(e){let t=Array.from(new TextEncoder().encode(e));return[255,3,t.length,...t]}function O(e){let t=[],n=0;for(let r of e){let e=r.tick-n;t.push(...C(e)),t.push(...r.data),n=r.tick}return t}function k(e,t){return e.tick===t.tick?(e.data[0]===255?0:1)-(t.data[0]===255?0:1):e.tick-t.tick}function A(e,t){let r=t?.enabled??!1,i=[];r&&(i.push({tick:0,data:D(`Tempo Map + Click`)}),i.push(..._(n(t.instrumentId))));let o=0;for(let t=0;t<e.length;t+=1){let n=e[t],r=o;i.push({tick:r,data:T(n.tempo)}),i.push({tick:r,data:E(n.numerator,n.denominator)}),o+=a(n)}r&&y(i,e,t.instrumentId);let s=i.sort(k),c=O(s),l=o,u=s.reduce((e,t)=>Math.max(e,t.tick),0);return c.push(...C(l-u)),c.push(255,47,0),new Uint8Array(c)}function j(e){let t=+(e.length>1),n=[];n.push(b),n.push(x(6)),n.push(S(t)),n.push(S(e.length)),n.push(S(480));for(let t of e)n.push(ee),n.push(x(t.length)),n.push(t);let r=n.reduce((e,t)=>e+t.length,0),i=new Uint8Array(r),a=0;for(let e of n)i.set(e,a),a+=e.length;return i}function te(e,t={}){if(e.length===0)throw Error(`At least one section is required`);return j([A(e,t.clickTrack)])}function ne(e){let t=e[0]?.label?.trim();return t&&t.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)||`song-structure`}function re(e){return`${ne(e)}.mid`}function ie(e,t,n){let r=new Blob([new Uint8Array(e)],{type:t}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=n,a.click(),URL.revokeObjectURL(i)}function ae(e,t={}){ie(te(e,t),`audio/midi`,re(e))}var M={enabled:!1,instrumentId:`pluck`},N=`garageband-song-structure-v1`,P=[2,4,8,16];function F(e){return e===`synthetic`?`pluck`:typeof e==`string`&&n(e).id===e?e:M.instrumentId}function I(){try{let e=localStorage.getItem(N);if(!e)return{sections:[],clickTrack:{...M}};let t=JSON.parse(e);return Array.isArray(t.sections)?{sections:t.sections,clickTrack:{enabled:t.clickTrack?.enabled??M.enabled,instrumentId:F(t.clickTrack?.instrumentId)}}:{sections:[],clickTrack:{...M}}}catch{return{sections:[],clickTrack:{...M}}}}function L(e){localStorage.setItem(N,JSON.stringify(e))}var R=I(),z=R.sections,B=R.clickTrack,V=new Set;function H(){L({sections:z,clickTrack:B})}function U(e){return V.add(e),()=>V.delete(e)}function W(){H(),V.forEach(e=>e())}function G(){return z}function K(){return B}function q(e){B={...B,enabled:e},W()}function oe(e){B={...B,instrumentId:e},W()}function se(e){return{id:crypto.randomUUID(),label:``,numerator:e?.numerator??4,denominator:e?.denominator??4,tempo:e?.tempo??120,bars:8}}function ce(){let e=z.at(-1);z=[...z,se(e)],W()}function J(e,t){z=z.map(n=>n.id===e?{...n,...t,id:n.id}:n),W()}function le(e){z=z.filter(t=>t.id!==e),W()}function ue(e,t){if(e===t||e<0||t<0||e>=z.length||t>=z.length)return;let n=[...z],[r]=n.splice(e,1);n.splice(t,0,r),z=n,W()}function Y(e){let t={};return(e.numerator<1||e.numerator>12)&&(t.numerator=`Must be 1–12`),(e.tempo<40||e.tempo>240)&&(t.tempo=`Must be 40–240 BPM`),(!Number.isInteger(e.bars)||e.bars<1)&&(t.bars=`Must be at least 1`),{valid:Object.keys(t).length===0,errors:t}}function X(e){return e.length>0&&e.every(e=>Y(e).valid)}function de(e,t){let n=Y(e),r=document.createElement(`article`);return r.className=`section-card`,r.dataset.sectionId=e.id,r.draggable=!0,r.innerHTML=`
    <div class="section-card__drag" aria-hidden="true" title="Drag to reorder">≡</div>
    <div class="section-card__body">
      <div class="section-card__header">
        <span class="section-card__index">#${t+1}</span>
        <input
          class="section-card__label"
          type="text"
          placeholder="Section label (optional)"
          value="${fe(e.label??``)}"
          aria-label="Section label"
        />
        <button class="section-card__delete" type="button" aria-label="Delete section">Delete</button>
      </div>
      <div class="section-card__fields">
        <label class="field">
          <span class="field__label">Time signature</span>
          <span class="time-sig-inputs">
            <input
              class="field__input field__input--narrow ${n.errors.numerator?`field__input--error`:``}"
              type="number"
              min="1"
              max="12"
              value="${e.numerator}"
              aria-label="Time signature numerator"
            />
            <span class="time-sig-separator">/</span>
            <select class="field__select field__input--narrow" aria-label="Time signature denominator">
              ${P.map(t=>`<option value="${t}" ${e.denominator===t?`selected`:``}>${t}</option>`).join(``)}
            </select>
          </span>
        </label>
        <label class="field">
          <span class="field__label">Tempo</span>
          <span class="tempo-input">
            <input
              class="field__input field__input--narrow ${n.errors.tempo?`field__input--error`:``}"
              type="number"
              min="40"
              max="240"
              value="${e.tempo}"
              aria-label="Tempo in BPM"
            />
            <span class="field__suffix">BPM</span>
          </span>
        </label>
        <label class="field">
          <span class="field__label">Bars</span>
          <input
            class="field__input field__input--narrow ${n.errors.bars?`field__input--error`:``}"
            type="number"
            min="1"
            value="${e.bars}"
            aria-label="Number of bars"
          />
        </label>
        <div class="section-card__duration">
          <span class="field__label">Duration</span>
          <span class="section-card__duration-value">${c(i(e))}</span>
        </div>
      </div>
      ${n.valid?``:`<p class="section-card__errors">${Object.values(n.errors).join(` · `)}</p>`}
    </div>
  `,Z(r,e.id),r}function Z(e,t){let n=e.querySelector(`.section-card__label`),r=e.querySelector(`input[aria-label="Time signature numerator"]`),i=e.querySelector(`select[aria-label="Time signature denominator"]`),a=e.querySelector(`input[aria-label="Tempo in BPM"]`),o=e.querySelector(`input[aria-label="Number of bars"]`),s=e.querySelector(`.section-card__delete`);n.addEventListener(`blur`,()=>{J(t,{label:n.value})}),r.addEventListener(`change`,()=>{J(t,{numerator:Number(r.value)})}),i.addEventListener(`change`,()=>{J(t,{denominator:Number(i.value)})}),a.addEventListener(`change`,()=>{J(t,{tempo:Number(a.value)})}),o.addEventListener(`change`,()=>{J(t,{bars:Number(o.value)})}),s.addEventListener(`click`,()=>{le(t)})}function fe(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`"`,`&quot;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}var Q=null;function pe(e){let t=document.createElement(`div`);return t.className=`section-list`,e.length===0?(t.innerHTML=`
      <div class="empty-state">
        <p>No sections yet. Add your first section to define tempo and time signature changes.</p>
      </div>
    `,t):(e.forEach((n,r)=>{let i=de(n,r);me(i,e),t.appendChild(i)}),t)}function me(e,t){let n=e.dataset.sectionId;e.addEventListener(`dragstart`,t=>{Q=n,e.classList.add(`section-card--dragging`),t.dataTransfer?.setData(`text/plain`,n),t.dataTransfer.effectAllowed=`move`}),e.addEventListener(`dragend`,()=>{Q=null,e.classList.remove(`section-card--dragging`),document.querySelectorAll(`.section-card--drop-target`).forEach(e=>{e.classList.remove(`section-card--drop-target`)})}),e.addEventListener(`dragover`,t=>{t.preventDefault(),!(!Q||Q===n)&&(e.classList.add(`section-card--drop-target`),t.dataTransfer.dropEffect=`move`)}),e.addEventListener(`dragleave`,()=>{e.classList.remove(`section-card--drop-target`)}),e.addEventListener(`drop`,r=>{if(r.preventDefault(),e.classList.remove(`section-card--drop-target`),!Q||Q===n)return;let i=t.findIndex(e=>e.id===Q),a=t.findIndex(e=>e.id===n);i>=0&&a>=0&&ue(i,a)})}function he(r){r.innerHTML=`
    <div class="app">
      <header class="app__header">
        <div>
          <h1 class="app__title">Song Structure Builder</h1>
          <p class="app__subtitle">Build a MIDI tempo map for GarageBand</p>
        </div>
        <button class="button button--primary" id="download-btn" type="button" disabled>
          Download MIDI
        </button>
      </header>
      <section class="export-options" aria-label="MIDI export options">
        <label class="export-options__toggle">
          <input id="click-enabled" type="checkbox" />
          <span>Add click track</span>
        </label>
        <label class="export-options__instrument">
          <span class="field__label">Click sound (MIDI notes)</span>
          <select id="click-instrument" class="field__select" aria-label="Click instrument">
            ${t.map(e=>`<option value="${e.id}">${e.label}</option>`).join(``)}
          </select>
        </label>
        <p class="export-options__hint" id="click-hint" hidden></p>
        <div class="garageband-help" id="garageband-help" hidden>
          <p class="garageband-help__title">GarageBand setup for the click track</p>
          <ol class="garageband-help__steps" id="garageband-steps"></ol>
          <p class="garageband-help__alt" id="garageband-alt" hidden></p>
        </div>
      </section>
      <main class="app__main">
        <div id="section-list-host"></div>
        <button class="button button--secondary" id="add-section-btn" type="button">
          + Add Section
        </button>
      </main>
      <footer class="app__footer" id="summary-footer" hidden>
        <span id="summary-bars"></span>
        <span class="summary-separator">·</span>
        <span id="summary-duration"></span>
      </footer>
    </div>
  `;let i=r.querySelector(`#section-list-host`),a=r.querySelector(`#add-section-btn`),l=r.querySelector(`#download-btn`),u=r.querySelector(`#summary-footer`),d=r.querySelector(`#summary-bars`),f=r.querySelector(`#summary-duration`),p=r.querySelector(`#click-enabled`),m=r.querySelector(`#click-instrument`),h=r.querySelector(`#click-hint`),g=r.querySelector(`#garageband-help`),_=r.querySelector(`#garageband-steps`),v=r.querySelector(`#garageband-alt`),y=()=>{let t=K(),i=n(t.instrumentId),a=i.id===`pluck`;p.checked=t.enabled,m.value=t.instrumentId,m.disabled=!t.enabled,r.querySelector(`.export-options`)?.classList.toggle(`export-options--active`,t.enabled),h.hidden=!t.enabled,g.hidden=!t.enabled,t.enabled&&(h.textContent=i.description,_.innerHTML=(a?e:[`Add a new Software Instrument track (+ in the header).`,`Select ${i.garageBandKit} in the Library.`,`Download and import the .mid file (File → Import → MIDI File).`,`Drag the imported MIDI region onto that instrument track.`]).map(e=>`<li>${e}</li>`).join(``),v.hidden=a,v.textContent=a?``:`Tip: for the clearest click, switch the preset to Future Rave Pluck (Synthesizer → Plucked).`)},b=()=>{let e=G();i.replaceChildren(pe(e)),y();let t=e.length>0;u.hidden=!t,t&&(d.textContent=`${o(e)} bars`,f.textContent=c(s(e))),l.disabled=!X(e)};a.addEventListener(`click`,()=>{ce()}),p.addEventListener(`change`,()=>{q(p.checked)}),m.addEventListener(`change`,()=>{oe(m.value)}),l.addEventListener(`click`,()=>{let e=G();X(e)&&ae(e,{clickTrack:K()})}),U(b),b()}var $=document.querySelector(`#app`);if(!$)throw Error(`Root element #app not found`);he($);