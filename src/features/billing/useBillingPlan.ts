"use client";
import { useEffect,useState } from "react"; import type { PlanSlug } from "./billing.types";
export function useBillingPlan(){const [plan,setPlan]=useState<PlanSlug>("free");const [loading,setLoading]=useState(true);useEffect(()=>{fetch("/api/billing/subscription",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(data=>{if(data?.plan)setPlan(data.plan);}).finally(()=>setLoading(false));},[]);return{plan,loading};}
