"use client";

import { useState } from "react";
import {
  Package,
  CreditCard,
  CheckCircle2,
  Circle,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import Sidebar from "@/components/sidebar";

const orders = [
  {
    id: "ORD-2026-1001",
    createdAt: "30 Jul 2026",
    total: 215000,
    paymentStatus: "Paid",
    status: "Preparing your order",
    items: [
      {
        name: "Samsung Galaxy A56",
        quantity: 1,
        price: 185000,
      },
      {
        name: "Tempered Glass",
        quantity: 1,
        price: 30000,
      },
    ],
  },
  {
    id: "ORD-2026-1000",
    createdAt: "25 Jul 2026",
    total: 85000,
    paymentStatus: "Paid",
    status: "Delivered",
    items: [
      {
        name: "AirPods Pro",
        quantity: 1,
        price: 85000,
      },
    ],
  },
];

const timeline = [
  "Order placed",
  "Payment confirmed",
  "Preparing your order",
  "Shipped",
  "Delivered",
];


export default function OrdersPage() {

  const [selectedOrder, setSelectedOrder] = useState(orders[0]);

  const activeStep =
    timeline.indexOf(selectedOrder.status);


  return (
    <div className="flex min-h-screen bg-paper/40">

      <Sidebar />

      <main className="mx-auto w-full max-w-7xl px-6 py-12">

        <div className="mb-8">
          <p className="text-sm text-mist">
            My Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-ink">
            My Orders
          </h1>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-sm lg:grid-cols-[380px_1fr]">
          <div className=" border-b border-navy-900/10 p-5 lg:border-b-0 lg:border-r">
            <h2 className="mb-5 text-xl font-semibold text-ink">
              Orders
            </h2>
            <div className="space-y-4">
              {orders.map((order)=>(
                <button
                  key={order._id ?? order.id}
                  onClick={()=>setSelectedOrder(order)}
                  className={`w-full text-left rounded-2xl border p-5 transition
                    ${
                      selectedOrder.id === order.id
                      ?
                      "border-gold bg-paper"
                      :
                      "border-navy-900/10 hover:bg-paper"
                    }
                  `}
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-ink">
                      {order.id}
                    </h3>
                    <span className="rounded-full bg-green-10 px-3 py-1 text-xs text-green-700">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-mist">
                    {order.createdAt}
                  </p>
                  <p className="mt-3 font-semibold text-ink">
                    ₦{order.total.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-gold">
                    {order.status}
                  </p>

                </button>
              ))}

            </div>

          </div>

          <div className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-mist">
                  Order Details
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ink">
                  {selectedOrder.id}
                </h2>
                <p className="mt-2 text-sm text-mist">
                  Placed on {selectedOrder.createdAt}
                </p>
              </div>
              <div className="
                rounded-xl
                bg-paper
                px-4
                py-3
              ">

                <CreditCard
                  size={20}
                  className="text-gold"
                />

                <p className="mt-1 font-semibold text-ink">
                  {selectedOrder.paymentStatus}
                </p>

              </div>


            </div>



            {/* PRODUCTS */}

            <section className="mt-8">

              <h3 className="
                mb-4
                text-lg
                font-semibold
                text-ink
              ">
                Products
              </h3>


              <div className="space-y-4">

                {selectedOrder.items.map(item=>(

                  <div
                    key={item.name}
                    className="
                      flex
                      justify-between
                      items-center
                      rounded-2xl
                      border
                      border-navy-900/10
                      p-4
                    "
                  >

                    <div className="flex gap-4">

                      <div className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-xl
                        bg-paper
                      ">
                        <Package
                          className="text-gold"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-ink">
                          {item.name}
                        </h4>
                        <p className="text-sm text-mist">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-ink">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">

              <h3 className="mb-5 text-lg font-semibold text-ink">
                Delivery Progress
              </h3>


              <div className="space-y-5">

                {timeline.map((step,index)=>(

                  <div key={step} className="flex gap-4" >
                    <div>

                      {
                        index <= activeStep
                        ?
                        <CheckCircle2 size={22} className="text-gold"
                        />
                        :
                        <Circle size={22} className="text-mist"/>
                      }
                    </div>
                    <p className={`
                      ${
                        index <= activeStep
                        ?
                        "text-ink"
                        :
                        "text-mist"
                      }
                    `}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}