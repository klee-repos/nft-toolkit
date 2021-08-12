import express from "express";
const router = express.Router();

import fs from "fs";
import Metadata from "../util/Metadata";

var uploadToPinata = async (metadata, path, name, type) => {
  return new Promise(async (resolve) => {
    // upload to IPFS using through Pinata
    let pinataResults = await metadata.uploadToPinata(path, name, type);
    console.log(pinataResults);
    resolve(pinataResults);
  }).catch((err) => {
    console.log(err);
    resolve();
  });
};

router.post("/create-metadata", async (req, res) => {
  try {
    let attributes = req.body.attributes;
    let description = req.body.description;
    let name = req.body.name;
    let attributeList = [];
    // gather image paths for attributes
    for (let a in attributes) {
      let type = attributes[a].trait_type;
      let value = attributes[a].value;
      let propertyPath = "properties/" + type + "-" + value + ".png";
      attributeList.push(propertyPath);
    }
    let metadata = new Metadata(attributes, description, name);
    console.log(`\n======== PNG ========\n`);
    // create whole png by combining attribute pngs
    let image = await metadata.combineAttribtutes(attributeList);
    await fs.writeFile(`images/${name}.png`, image.data, function (err) {});
    // upload png to IPFS using through Pinata
    let pinataResults = await uploadToPinata(
      metadata,
      `images/${name}.png`,
      name,
      "png"
    );
    console.log(`\n======== METADATA ========\n`);
    // create OpenSea formatted metadata
    let openSeaMetadata = metadata.createOpenSeaMetadata(pinataResults);
    console.log(openSeaMetadata);
    await fs.writeFileSync(
      `metadata/${name}.json`,
      JSON.stringify(openSeaMetadata)
    );
    // upload json to IPFS using through Pinata
    pinataResults = await uploadToPinata(
      metadata,
      `metadata/${name}.json`,
      name,
      "json"
    );
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

export default router;
