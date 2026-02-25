#!/usr/bin/env python3
"""
Fetch public holidays for Brazil (BR) and China (CN) for given years and write
JSON files in the same format used by conselhobeijing/src/data/*.json.

Usage examples:
  python conselhobeijing/fetch_holidays.py 2025 2026
  python conselhobeijing/fetch_holidays.py 2025 2026 --out-dir ./data

This script uses the free Nager.Date public holidays API:
  https://date.nager.at/swagger/index.html

Output files (default location):
  conselhobeijing/src/data/holidays-br.json
  conselhobeijing/src/data/holidays-cn.json

Events are written as an array of objects with keys: title, start, allDay, (optional) end
"""

from __future__ import annotations
import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta

API_URL = "https://date.nager.at/api/v3/PublicHolidays/{year}/{country}"
COUNTRY_FILES = {"BR": "holidays-br.json", "CN": "holidays-cn.json"}

def fetch_year_country(year: int, country: str) -> list:
    url = API_URL.format(year=year, country=country)
    req = urllib.request.Request(url, headers={"User-Agent": "conselhobj-holiday-fetcher/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status != 200:
                raise urllib.error.HTTPError(url, resp.status, resp.reason, resp.headers, None)
            return json.load(resp)
    except Exception:
        raise


def merge_consecutive_same_name(entries: list) -> list:
    """Merge consecutive days with the same holiday name into a single event with an end date.

    Input entries are expected to have a 'date' field (YYYY-MM-DD) and either 'localName' or 'name'.
    """
    if not entries:
        return []
    # Sort by date
    entries_sorted = sorted(entries, key=lambda e: e["date"])  # date strings sort lexicographically correctly
    events = []
    i = 0
    while i < len(entries_sorted):
        cur = entries_sorted[i]
        title = cur.get("localName") or cur.get("name") or ""
        start = datetime.strptime(cur["date"], "%Y-%m-%d").date()
        end = start
        j = i + 1
        while j < len(entries_sorted):
            nxt = entries_sorted[j]
            nxt_title = nxt.get("localName") or nxt.get("name") or ""
            nxt_date = datetime.strptime(nxt["date"], "%Y-%m-%d").date()
            if nxt_title == title and nxt_date == end + timedelta(days=1):
                end = nxt_date
                j += 1
            else:
                break
        event = {"title": title, "start": start.isoformat(), "allDay": True}
        if end > start:
            # keep end as the last inclusive day to be consistent with existing files
            event["end"] = end.isoformat()
        events.append(event)
        i = j
    return events


def gather_and_write(years: list[int], out_dir: str) -> None:
    os.makedirs(out_dir, exist_ok=True)
    for country_code, filename in COUNTRY_FILES.items():
        all_entries: list = []
        for year in years:
            try:
                data = fetch_year_country(year, country_code)
            except Exception as exc:  # network or HTTP error
                print(f"Warning: failed to fetch {country_code} {year}: {exc}", file=sys.stderr)
                continue
            # Nager.Date returns a list of holiday objects with a 'date' key
            all_entries.extend(data)
        events = merge_consecutive_same_name(all_entries)
        out_path = os.path.join(out_dir, filename)
        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(events, fh, ensure_ascii=False, indent=2)
        print(f"Wrote {len(events)} events to {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch public holidays for BR and CN and write JSON files.")
    parser.add_argument("years", metavar="YEAR", type=int, nargs="+", help="Years to fetch (e.g. 2025 2026)")
    parser.add_argument("--out-dir", default=None, help="Directory to write JSON files (defaults to conselhobeijing/src/data)")
    args = parser.parse_args()

    if args.out_dir:
        out_dir = os.path.abspath(args.out_dir)
    else:
        # script is placed in conselhobeijing/; default data dir is conselhobeijing/src/data
        out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "src", "data"))

    gather_and_write(list(args.years), out_dir)
