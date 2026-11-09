import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {SUPABASE_URL,SUPABASE_ANON_KEY,isSupabaseConfigured} from "./supabase-config.js";
import {notice,$} from "./shared.js";
const msg=document.querySelector("#msg");
if(!isSupabaseConfigured){notice(msg,"Backend setup बाकी है। README.md के Supabase Setup चरण पूरे करें।");}
else{
 const supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 const login=document.querySelector("#loginForm");
 if(login) login.addEventListener("submit",async e=>{e.preventDefault();const {data,error}=await supabase.auth.signInWithPassword({email:document.querySelector("#email").value.trim(),password:document.querySelector("#password").value});if(error)return notice(msg,error.message);const {data:p}=await supabase.from("profiles").select("role").eq("id",data.user.id).single();location.href=p?.role==="admin"?"admin.html":p?.role==="publisher"?"publisher.html":p?.role==="author"?"author-dashboard.html":"index.html";});
 const reg=document.querySelector("#registerForm");
 if(reg)reg.addEventListener("submit",async e=>{e.preventDefault();const {data,error}=await supabase.auth.signUp({email:$("#email").value.trim(),password:$("#password").value,options:{data:{full_name:$("#name").value.trim(),requested_role:$("#accountType").value}}});if(error)return notice(msg,error.message);notice(msg,"पंजीकरण अनुरोध सफल। ईमेल पुष्टि आवश्यक हो सकती है।");});
 const reset=$("#reset");if(reset)reset.addEventListener("click",async()=>{const email=$("#email").value.trim();if(!email)return notice(msg,"पहले ईमेल दर्ज करें।");const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname.replace("login.html","")});notice(msg,error?error.message:"यदि ईमेल पंजीकृत है तो Reset लिंक भेजा गया है।");});
}