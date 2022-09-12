import { createPerPointerListeners } from "@solid-primitives/pointer";
import { For, createMemo, createEffect, batch } from "solid-js";

import { createStore } from "solid-js/store";
// @ts-ignore
import idMaker from "@melodev/id-maker";
import { isMobile } from "./utils";

type IStore = {
  slotId: string | null;
  slotIdx: number | null;
  gesture: "idle" | "drag:middle" | "drag:top" | "drag:bottom";
  slots: {
    id: string;
    pos: {
      x: number;
      y: number;
    };
    height: number;
  }[];
};

export const App = () => {
  isMobile();
  let containerRef!: HTMLDivElement;
  const [store, setStore] = createStore<IStore>({
    slotId: null,
    slotIdx: null,
    gesture: "idle",
    slots: [
      {
        id: idMaker(),
        pos: {
          x: 300,
          y: 0,
        },
        height: 70,
      },
      {
        id: idMaker(),
        pos: {
          x: 200,
          y: 500,
        },
        height: 40,
      },
      {
        id: idMaker(),
        pos: {
          x: 0,
          y: 400,
        },
        height: 60,
      },
      {
        id: idMaker(),
        pos: {
          x: 500,
          y: 300,
        },
        height: 30,
      },
    ],
  });

  createPerPointerListeners({
    target: () => containerRef,
    onEnter(e, { onDown, onMove, onUp, onLeave }) {
      let last: { x: number; y: number } | null;
      onDown(({ x, y }) => (last = { x, y }));
      onUp(() => {
        last = null;
        setStore("gesture", "idle");
        console.log("dropped", store.slotId);
      });
      onLeave(() => (last = null));
      onMove(({ x, y, movementY, movementX }) => {
        if (!last) return;

        if (store.gesture === "drag:middle") {
          setStore("slots", store.slotIdx!, "pos", (p) => ({
            x: p.x + x - last!.x,
            y: p.y + y - last!.y,
          }));
        }

        if (store.gesture === "drag:top") {
          batch(() => {
            setStore("slots", store.slotIdx!, "height", (h) => h + (last!.y - y));
            setStore("slots", store.slotIdx!, "pos", (p) => ({
              x: p.x,
              y: p.y + y - last!.y,
            }));
          });
        }

        if (store.gesture === "drag:bottom") {
          batch(() => {
            setStore("slots", store.slotIdx!, "height", (h) => h + (y - last!.y));
            setStore("slots", store.slotIdx!, "pos", (p) => ({
              x: p.x,
              y: p.y,
            }));
          });
        }

        last = { x, y };
      });
    },
  });

  return (
    <div ref={containerRef} class="relative w-[150vw] h-[150vh] box-border bg-gray-800 text-white">
      <For each={store.slots}>
        {(slot, idx) => {
          let slotRef!: HTMLDivElement;
          let middleRef!: HTMLDivElement;
          let topRef!: HTMLDivElement;
          let bottomRef!: HTMLDivElement;

          // SLOT LISTENER
          createPerPointerListeners({
            target: () => slotRef,
            onEnter(e, { onDown, onMove, onUp, onLeave }) {
              onDown(({ x, y }) => {
                batch(() => {
                  setStore("slotId", slot.id);
                  setStore("slotIdx", idx());
                });
              });
            },
          });

          // MIDDLE LISTENER
          createPerPointerListeners({
            target: () => middleRef,
            onEnter(e, { onDown, onMove, onUp, onLeave }) {
              onDown(({ x, y }) => {
                setStore("gesture", "drag:middle");
              });
            },
          });

          // TOP LISTENER
          createPerPointerListeners({
            target: () => topRef,
            onEnter(e, { onDown, onMove, onUp, onLeave }) {
              onDown(({ x, y }) => {
                setStore("gesture", "drag:top");
              });
            },
          });

          // BOTTOM LISTENER
          createPerPointerListeners({
            target: () => bottomRef,
            onEnter(e, { onDown, onMove, onUp, onLeave }) {
              onDown(({ x, y }) => {
                setStore("gesture", "drag:bottom");
              });
            },
          });

          const height = createMemo(() => `${slot.height}px`);
          const top = createMemo(() => `${slot.pos.y}px`);
          const left = createMemo(() => `${slot.pos.x}px`);
          const transform = createMemo(() => `translate(${slot.pos.x}px, ${slot.pos.y}px)`);

          return (
            <div
              id={slot.id}
              ref={slotRef}
              class="absolute bg-blue-600"
              style={{
                top: top(),
                left: left(),
                // transform: transform(),
                transition: "ease-out .2s",
              }}
            >
              <div
                ref={topRef}
                class="w-32 h-6  bg-slate-500"
                style={{
                  "touch-action": "none",
                }}
              ></div>
              <div
                ref={middleRef}
                class="h-[100%] flex flex-col justify-center items-center "
                style={{
                  "touch-action": "none",
                  "user-select": "none",
                  height: height(),
                }}
              >
                <p>{slot.id}</p>
                <p>{store.slotId === slot.id ? store.gesture : "idle"}</p>
              </div>
              <div
                ref={bottomRef}
                class="w-32 h-6 bg-slate-500"
                style={{
                  "touch-action": "none",
                }}
              ></div>
              {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
            </div>
          );
        }}
      </For>
      <pre style={{ "user-select": "none" }}>{JSON.stringify(store, null, 2)}</pre>
    </div>
  );
};
