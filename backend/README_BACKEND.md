# Video Editor Backend

## Setup
1. Install Python 3.8+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend:
   ```bash
   python app.py
   ```

The backend runs on `http://localhost:5000`.

## Features
-   Receives video files and time segments.
-   Clips segments and merges them in the provided order.
-   Handles audio muting based on request.
-   Saves results to `../resultvideos`.
