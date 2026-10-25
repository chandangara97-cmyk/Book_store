/* ====== EDIT THESE: your real details, books and reviews ====== */
const CONFIG={email:"bookstore@example.com",phone:"+91 00000 00000",whatsapp:"910000000000",address:"Add your bookstore address here",upi:"yourname@upi",payLink:""}; // upi = your UPI ID; payLink = your Razorpay/PayU payment link (optional)
const PRICES={Fiction:299,Learning:349,Children:199,Gifts:399}; // placeholder prices in ₹: set real ones, or add p:<price> to a book
const OPTS={buy:["Buy · paperback",1],r7:["Borrow · 7 days",.2],r14:["Borrow · 14 days",.3],r30:["Borrow · 30 days",.45],dig:["Digital copy (PDF)",.6]}; // [label, share of book price]
const BOOKS=[ // t=title, c=category, k=cover colour. Replace with your real titles.
{t:"The Art of Wonder",c:"Fiction",k:"#254f42"},{t:"Little Worlds",c:"Children",k:"#b7764e"},{t:"Ideas for Life",c:"Learning",k:"#a87532"},{t:"Make Room for Magic",c:"Gifts",k:"#7c8a69"},
{t:"The Lantern Keeper",c:"Fiction",k:"#3b4f7a"},{t:"Midnight in the Library",c:"Fiction",k:"#5a3d6b"},{t:"Small Habits, Big Days",c:"Learning",k:"#2f6b6b"},{t:"Think Like a Founder",c:"Learning",k:"#8a4b3a"},
{t:"The Sleepy Sun",c:"Children",k:"#c2813a"},{t:"Ziggy and the Stars",c:"Children",k:"#3f7a5a"},{t:"A Book for Every Birthday",c:"Gifts",k:"#a14a63"},{t:"Letters to My Future Self",c:"Gifts",k:"#4d5d3a"}];
const REVIEWS=[ // Sample reviews: replace with real ones from your customers (set sample:false)
{n:"Anita R.",s:5,b:"The Art of Wonder",t:"Couldn’t put it down. Tanuja’s recommendation was spot on, and it arrived beautifully packed.",sample:true},
{n:"Rohan M.",s:5,b:"Ideas for Life",t:"Practical, warm and easy to read. I’ve already passed it on to two friends.",sample:true},
{n:"Meera K.",s:5,b:"Little Worlds",t:"My daughter asks for it every single night. The best bedtime book we’ve found.",sample:true},
{n:"Sahil D.",s:4,b:"A Book for Every Birthday",t:"Chose it as a gift and it was a huge hit. Great help picking the right one.",sample:true},
{n:"Kavya P.",s:5,b:"The Lantern Keeper",t:"Atmospheric and gripping. A lovely shop run by someone who truly reads.",sample:true},
{n:"Imran A.",s:5,b:"Small Habits, Big Days",t:"Short chapters, big ideas. Perfect for my morning routine.",sample:true}];
/* ============================================================== */
const NIL={style:{},value:"",classList:{add(){},remove(){},toggle(){}},addEventListener(){}};const goContact=(m,i)=>{try{localStorage.setItem("rn_pre",JSON.stringify({m,i}))}catch(e){}location.href="contact.html"};const $=s=>document.querySelector(s)||NIL,$$=s=>[...document.querySelectorAll(s)],COL=["#245747","#b7764e","#7c8a69","#a87532","#3b4f7a","#a14a63"];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const init=n=>n.trim()[0].toUpperCase(),colr=n=>COL[n.length%COL.length];
let saved=[],mine=[],cat="All",stars=0;
try{saved=JSON.parse(localStorage.getItem("rn_saved")||"[]");mine=JSON.parse(localStorage.getItem("rn_rev")||"[]")}catch(e){}
const persist=()=>{try{localStorage.setItem("rn_saved",JSON.stringify(saved));localStorage.setItem("rn_rev",JSON.stringify(mine))}catch(e){}};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2400)};
const cover=(b,x="")=>`<div class="cover" style="background:${b.k};${x}"><small>${esc(b.c)}</small><strong>${esc(b.t)}</strong><small>The Reading Nook</small></div>`;
const price=(b,k)=>Math.round((b.p||PRICES[b.c])*OPTS[k][1]);const optHtml=b=>Object.keys(OPTS).map(k=>`<option value="${k}">${OPTS[k][0]} — ₹${price(b,k)}</option>`).join("");
const card=b=>`<article class="book">${cover(b)}<div><div class="meta">${esc(b.c)}</div><h3>${esc(b.t)}</h3></div><select class="opt" aria-label="Choose option">${optHtml(b)}</select><div class="acts"><button class="btn" data-add="${esc(b.t)}">Add to bag</button><button class="btn ghost" data-enq="${esc(b.t)}" style="flex:0;padding:8px 12px">Ask</button><button class="heart ${saved.includes(b.t)?"on":""}" data-save="${esc(b.t)}" aria-label="Save ${esc(b.t)}">${saved.includes(b.t)?"♥":"♡"}</button></div></article>`;
const all=()=>[...mine,...REVIEWS];
const revCard=r=>`<article class="rev"><div class="stars">${"★".repeat(r.s)}${"☆".repeat(5-r.s)}</div><p>“${esc(r.t)}”</p><div class="who"><i style="background:${colr(r.n)}">${esc(init(r.n))}</i><div><b>${esc(r.n)}${r.sample?'<span class="tag">Sample</span>':""}</b>on ${esc(r.b)}</div></div></article>`;
function drawShelf(){const q=$("#q").value.toLowerCase();const l=BOOKS.filter(b=>(cat==="All"||b.c===cat)&&b.t.toLowerCase().includes(q));$("#shelf").innerHTML=l.map(card).join("");$("#none").style.display=l.length?"none":"block"}
function drawAll(){
 $("#heroStack").innerHTML=[0,1,2].map(i=>`<div style="display:contents">${cover(BOOKS[i]).replace('class="cover"','class="cover s'+(i+1)+'"')}</div>`).join("");
 $("#featured").innerHTML=BOOKS.slice(0,4).map(card).join("");
 const tk=all().map(r=>`★ “${esc(r.t.split(".")[0])}” — ${esc(r.n)}`);$("#ticker").innerHTML=[...tk,...tk].map(t=>`<span>${t}</span>`).join("");
 $("#homeRev").innerHTML=all().slice(0,3).map(revCard).join("");
 $("#revList").innerHTML=all().map(revCard).join("");
 const a=all(),n=a.length,avg=a.reduce((x,r)=>x+r.s,0)/n;$("#avg").textContent=avg.toFixed(1);$("#avgStars").textContent="★".repeat(Math.round(avg))+"☆".repeat(5-Math.round(avg));$("#cnt").textContent=`Based on ${n} reader review${n>1?"s":""}`;
 $("#bars").innerHTML=[5,4,3,2,1].map(s=>{const c=a.filter(r=>r.s===s).length;return`<div class="bar"><span>${s}★</span><span><em style="width:${c/n*100}%"></em></span><span>${c}</span></div>`}).join("");
 $("#sc").textContent=saved.length;drawShelf();
}
$("#chips").innerHTML=["All","Fiction","Learning","Children","Gifts"].map(c=>`<button class="chip ${c==="All"?"on":""}" data-cat="${c}">${c}</button>`).join("");
$("#rb").innerHTML=BOOKS.map(b=>`<option>${esc(b.t)}</option>`).join("");
$("#rate").innerHTML=[1,2,3,4,5].map(i=>`<span data-s="${i}">★</span>`).join("");
document.addEventListener("click",e=>{const t=e.target;
 if(t.dataset.cat){cat=t.dataset.cat;$$(".chip").forEach(c=>c.classList.toggle("on",c===t));drawShelf()}
 if(t.dataset.save){const k=t.dataset.save;saved=saved.includes(k)?saved.filter(x=>x!==k):[...saved,k];persist();toast(saved.includes(k)?"Saved ♥":"Removed");drawAll()}
 if(t.dataset.enq){goContact("Hi! I’d like to enquire about “"+t.dataset.enq+"”. Is it available, and at what price?","A specific title or author")}
 if(t.dataset.s){stars=+t.dataset.s;$$("#rate span").forEach(s=>s.classList.toggle("on",+s.dataset.s<=stars))}
 if(t.closest("#savedBtn")){if(!saved.length)return toast("Tap ♥ on a book to save it");goContact("I’d love to enquire about these books:\n- "+saved.join("\n- "),"Book recommendations")}
});
$("#q").addEventListener("input",drawShelf);
$("#revForm").addEventListener("submit",e=>{e.preventDefault();if(!stars)return toast("Please pick a star rating");
 mine.unshift({n:$("#rn").value.trim(),s:stars,b:$("#rb").value,t:$("#rt").value.trim()});persist();e.target.reset();stars=0;$$("#rate span").forEach(s=>s.classList.remove("on"));drawAll();toast("Thank you! Your review is up ♥")});
$("#cForm").addEventListener("submit",e=>{e.preventDefault();const b="Name: "+$("#cn").value+"\nEmail: "+$("#ce").value+"\nInterested in: "+$("#ci").value+"\n\n"+$("#cm").value;location.href="mailto:"+CONFIG.email+"?subject="+encodeURIComponent("Book enquiry from "+$("#cn").value)+"&body="+encodeURIComponent(b)});
$("#cPhone").textContent=CONFIG.phone;$("#cEmail").textContent=CONFIG.email;$("#cAddr").textContent=CONFIG.address;
$("#cWa").href="https://wa.me/"+CONFIG.whatsapp;$("#cMail").href="mailto:"+CONFIG.email;$("#yr").textContent=new Date().getFullYear();
$("#burger").addEventListener("click",()=>{const l=$("#links");l.classList.toggle("open");$("#burger").textContent=l.classList.contains("open")?"×":"☰"});
function route(){const v=document.body.dataset.page;$$(".links a").forEach(a=>a.classList.toggle("on",a.dataset.v===v));$("#links").classList.remove("open");$("#burger").textContent="☰"}
drawAll();drawCart();route();
if(document.body.dataset.page==="contact"){try{const p=JSON.parse(localStorage.getItem("rn_pre")||"null");if(p){$("#cm").value=p.m;$("#ci").value=p.i;localStorage.removeItem("rn_pre")}}catch(e){}}
