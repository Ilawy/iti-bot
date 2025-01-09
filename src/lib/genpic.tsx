/**@jsx React.createElement */
import React from "https://esm.sh/react@18.2.0";
import satori from "npm:satori";
import { Problem } from "npm:leetcode-query";
import { render } from "https://deno.land/x/resvg_wasm@0.2.0/mod.ts";

const ArialBuffer = await Deno.readFile("./fonts/Arial.ttf");

const COLOR_GREEN = "#3e6";
const COLOR_YELLOW = "#FCC737";
const COLOR_RED = "#F95454";

const template = ({ title, difficulty }: Problem, today: Date) => (
  <div
    style={{
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      // fontSize: 32,
      fontWeight: 600,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ddd",
        borderRadius: 24,
        padding: "0.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 24 }}>{title}</span>
      <span
        style={{
          backgroundColor: difficulty === "Easy"
            ? COLOR_GREEN
            : difficulty === "Medium"
            ? COLOR_YELLOW
            : COLOR_RED,
          maxWidth: 8 + 10 * difficulty.length,
          padding: "0.25rem 1rem",
          minWidth: 3,
          borderRadius: 6,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {difficulty}
      </span>
      <span>{today.toDateString()}</span>
    </div>
  </div>
);

export async function renderProblem(problem: Problem, today: Date) {
  const svg = await satori(
    template(problem, today),
    {
      width: 320,
      height: 180,
      fonts: [
        {
          name: "Roboto",
          // Use `fs` (Node.js only) or `fetch` to read the font as Buffer/ArrayBuffer and provide `data` here.
          data: ArialBuffer,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  return await render(svg);
}
