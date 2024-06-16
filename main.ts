import Project from "./helper_classes/project";

async function main() {
  const resourcePath = process.env.RESOURCE_PATH || "./example/simple_server";
  const result = await Project.readDirectory(resourcePath);
}

main();
