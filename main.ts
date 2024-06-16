import project_reader from "./helpers/project_reader";

async function main() {
    const resourcePath = process.env.RESOURCE_PATH || "./example/simple_server";
    const result = await project_reader(resourcePath);
    console.log("Result: ", result);
}

main();