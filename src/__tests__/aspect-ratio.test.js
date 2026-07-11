import { testToolConfig } from "./helpers/tool-config-test.js";

testToolConfig(() => import("../tools/math/aspect-ratio.js"), {
  id: "aspect-ratio",
  name: "Aspect Ratio Calculator",
  category: "math"
});
