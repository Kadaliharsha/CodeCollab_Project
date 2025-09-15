import os
from sqlalchemy import create_engine, text


def get_database_uri() -> str:
    env_url = os.environ.get("DATABASE_URL")
    if env_url:
        return env_url
    # Fallback to Config in this folder without importing the Flask app
    from config import Config  # safe import
    return Config.SQLALCHEMY_DATABASE_URI


def main() -> None:
    uri = get_database_uri()
    engine = create_engine(uri)
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE user_presence ALTER COLUMN user_id DROP NOT NULL"))
    print("OK: user_presence.user_id is now NULLABLE")


if __name__ == "__main__":
    main()


