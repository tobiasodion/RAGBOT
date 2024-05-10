import fs from "node:fs";

const createPathIfNotExist = (path) => {
  try {
    fs.mkdirSync(path, { recursive: true });
    console.log(`Path '${path}' created successfully.`);
  } catch (error) {
    console.error(`Error creating path '${path}':`, error);
  }
};

export const writeToFile = async (filePath, data) => {
  const directory = filePath.substring(0, filePath.lastIndexOf("/"));
  createPathIfNotExist(directory);

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("Data has been written to", filePath);
    }
  });
};

export const readFromFile = async (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error("Error reading file:", err);
    return null;
  }
};
