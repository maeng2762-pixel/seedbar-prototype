// jscodeshift transform
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Here we would find calls to choreographyProjectModel and userModel, and add `await`, and then make the enclosing function `async`.
  // However, jscodeshift can be complex for cascading async/await. We can use a simpler approach: regex or GitHub Copilot/LLM to rewrite them.

  return root.toSource();
}
