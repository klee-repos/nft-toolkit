require("dotenv").config();
import mergeImages from "merge-images";
import { Canvas, Image } from "canvas";

const fs = require("fs");

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

var decodeBase64Image = (dataString) => {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }
  response.type = matches[1];
  response.data = new Buffer(matches[2], "base64");
  return response;
};

class Metadata {
  constructor(attributes, description, name) {
    this.attributes = attributes;
    this.description = description;
    this.name = name;
  }

  async combineAttribtutes(attributeList) {
    return new Promise((resolve) => {
      mergeImages(attributeList, {
        Canvas: Canvas,
        Image: Image,
      })
        .then((b64) => {
          var imageBuffer = decodeBase64Image(b64);
          resolve(imageBuffer);
        })
        .catch((err) => {
          console.log(err);
          resolve(null);
        });
    });
  }

  async uploadToPinata(path, name, type) {
    return new Promise((resolve) => {
      let readableStreamForFile;
      let options = {
        pinataMetadata: {
          name: `${name}.${type}`,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      if (type === 'png') {
        readableStreamForFile = fs.createReadStream(path);
        pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
          resolve(result);
        }).catch(err => {
          console.log(err)
          resolve()
        })
      } else if (type === 'json') {
        let nftMetadata = fs.readFileSync(path)
        // let nftMetadata = JSON.parse(jsonfile);
        pinata.pinJSONToIPFS(JSON.parse(nftMetadata), options).then((result) => {
          resolve(result);
        }).catch(err => {
          console.log(err)
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  createOpenSeaMetadata(pinataResults) {
    let openSeaMetadata = {
      attributes: this.attributes,
      description: this.description,
      image: `https://gateway.pinata.cloud/ipfs/${pinataResults.IpfsHash}`,
      name: this.name,
    };
    return openSeaMetadata;
  }
}

export default Metadata;
