import os
import requests
import json

# Your NFT.Storage API key
API_KEY = '9cace3a8.e0049bbd3ccb404bad8c6bfbfff97837'
# NFT.Storage endpoint for uploading files
UPLOAD_URL = "https://api.nft.storage/upload"

# The folder where your metadata files are stored
METADATA_DIR = "./metadata_files"

# Headers required by NFT.Storage
HEADERS = {
    'Authorization': f'Bearer {API_KEY}'
}

def upload_file(filepath):
    """Uploads a file to NFT.Storage and returns the IPFS CID if successful."""
    with open(filepath, "rb") as file_data:
        response = requests.post(UPLOAD_URL, headers=HEADERS, files={'file': file_data})
    if response.status_code in (200, 202):
        result = response.json()
        cid = result.get("value", {}).get("cid")
        if cid:
            print(f"Uploaded {os.path.basename(filepath)} successfully. CID: {cid}")
            return cid
        else:
            print(f"Upload succeeded but no CID returned for {os.path.basename(filepath)}.")
    else:
        print(f"Failed to upload {os.path.basename(filepath)}. Status code: {response.status_code}")
        try:
            print("Response:", response.json())
        except Exception:
            print("Response content:", response.text)
    return None

def main():
    # Ensure the metadata directory exists
    if not os.path.exists(METADATA_DIR):
        print(f"Directory {METADATA_DIR} does not exist.")
        return

    # Iterate over all JSON files in the directory
    for filename in os.listdir(METADATA_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(METADATA_DIR, filename)
            cid = upload_file(filepath)
            # You might want to store the mapping of filename to CID for later reference.
            if cid:
                # For example, you could save it to a local JSON file.
                mapping = {filename: f"ipfs://{cid}"}
                with open("uploaded_metadata_mapping.json", "a") as mapping_file:
                    mapping_file.write(json.dumps(mapping) + "\n")

if __name__ == "__main__":
    main()
