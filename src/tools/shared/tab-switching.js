export function wireTabSwitching(container) {
  const tabs = container.querySelectorAll(".tab");
  tabs.forEach(t =>
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      container
        .querySelectorAll(".tab-panel")
        .forEach(p => p.classList.toggle("active", p.id === t.dataset.tab + "-panel"));
    })
  );
}
