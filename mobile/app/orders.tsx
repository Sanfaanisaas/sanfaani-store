import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { listOrders } from "../src/api";
import type { PublicOrder } from "../../src/lib/api/contracts";
export default function Orders(){const [orders,setOrders]=useState<PublicOrder[]>([]);const [state,setState]=useState('loading');useEffect(()=>{let active=true;listOrders().then((data)=>{if(active){const list=Array.isArray(data)?data:(data as {orders:PublicOrder[]}).orders||[];setOrders(list);setState('ready')}}).catch(()=>active&&setState('unavailable'));return()=>{active=false}},[]);return <View style={{flex:1,padding:20}}>{state==='loading'&&<Text>Loading orders…</Text>}{state==='unavailable'&&<Text>Orders unavailable or sign-in is required.</Text>}{state==='ready'&&orders.length===0&&<Text>No orders yet.</Text>}<FlatList data={orders} keyExtractor={(item)=>item.id} renderItem={({item})=><Text>{'Order #'+item.id+' — ₦'+item.total.toLocaleString()}</Text>} /></View>}

