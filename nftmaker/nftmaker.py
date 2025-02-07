import requests
import json
import time

# Base URL for fetching Pokémon data
BASE_URL = "https://pokeapi.co/api/v2/pokemon/"

def fetch_pokemon_data(pokemon_id):
    """
    Fetch data for a single Pokémon by its ID from the PokeAPI.
    Returns the JSON response if successful, otherwise None.
    """
    url = f"{BASE_URL}{pokemon_id}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching Pokémon ID {pokemon_id}: {response.status_code}")
        return None

def determine_rarity(base_experience):
    """
    Determine a rarity tier based on base_experience.
    Adjust these thresholds as needed.
      - Common: base_experience < 100
      - Uncommon: 100 <= base_experience < 200
      - Rare: 200 <= base_experience < 300
      - Legendary: base_experience >= 300
    """
    if base_experience < 100:
        return "Common"
    elif base_experience < 200:
        return "Uncommon"
    elif base_experience < 300:
        return "Rare"
    else:
        return "Legendary"

def generate_metadata(pokemon_data):
    """
    Generate a metadata dictionary for a Pokémon.
    Uses the official artwork image and includes Pokémon stats and rarity.
    """
    # Get the official artwork URL
    official_artwork = pokemon_data["sprites"]["other"]["official-artwork"]["front_default"]

    # Build a list of attributes from the Pokémon's stats
    stats_attributes = []
    for stat in pokemon_data["stats"]:
        stats_attributes.append({
            "trait_type": stat["stat"]["name"].capitalize(),
            "value": stat["base_stat"]
        })
    
    # Determine rarity based on base_experience
    base_experience = pokemon_data.get("base_experience", 0)
    rarity = determine_rarity(base_experience)
    
    metadata = {
        "name": pokemon_data["name"].capitalize(),
        "description": f"An NFT representing the Pokémon {pokemon_data['name'].capitalize()}.",
        "image": official_artwork,
        "attributes": stats_attributes + [
            {"trait_type": "Base Experience", "value": base_experience},
            {"trait_type": "Rarity", "value": rarity}
        ]
    }
    return metadata

def main():
    total_unique_pokemon = 1025  # Total unique Pokémon available in the PokeAPI
    print("Starting metadata generation for unique Pokémon...")

    for pokemon_id in range(1, total_unique_pokemon + 1):
        data = fetch_pokemon_data(pokemon_id)
        if data:
            metadata = generate_metadata(data)
            filename = f"metadata_{pokemon_id}.json"
            with open(filename, "w") as f:
                json.dump(metadata, f, indent=4)
            print(f"Generated metadata for Pokémon ID {pokemon_id}")
        else:
            print(f"Skipping Pokémon ID {pokemon_id} due to an error.")
        # Pause to avoid hitting API rate limits
        time.sleep(0.1)

    print("Finished generating metadata for all unique Pokémon.")

if __name__ == "__main__":
    main()
