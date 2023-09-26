import { config } from "../../config";

export async function pinJSONToIPFS(json: unknown) {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${config.pinata.jwt}`,
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataOptions: { cidVersion: 0 },
    }),
  };

  return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", options).then(
    (response) => response.json()
  );
}

export async function fetchFromIPFS(cid: string) {
  return fetch(
    `https://peach-worrying-marlin-261.mypinata.cloud/ipfs/${cid}?pinataGatewayToken=${config.pinata.token}`
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      throw error;
    });
}
