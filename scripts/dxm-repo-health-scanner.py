#!/usr/bin/env python3
"""
DXM Repo Health Scanner
Audits codebase for: missing imports, dead components, broken exports,
ASIN validity, JSON schema failures, duplicate products.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Set, Dict, List, Tuple
from collections import defaultdict

class DXMRepoScanner:
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.issues = defaultdict(list)
        self.warnings = defaultdict(list)
        self.info = defaultdict(list)

    def scan_all(self):
        """Run all health checks."""
        print("🔍 DXM Repo Health Scanner")
        print("=" * 70)

        print("\n1️⃣ Scanning for missing imports...")
        self.check_missing_imports()

        print("2️⃣ Scanning for dead components...")
        self.check_dead_components()

        print("3️⃣ Scanning for broken exports...")
        self.check_broken_exports()

        print("4️⃣ Validating ASIN format...")
        self.check_asin_validity()

        print("5️⃣ Validating JSON schemas...")
        self.check_json_schemas()

        print("6️⃣ Checking for duplicate products...")
        self.check_duplicate_products()

        print("\n" + "=" * 70)
        self.print_report()

    def check_missing_imports(self):
        """Find undefined variables and missing imports."""
        src_dir = self.repo_path / "src"
        ts_files = list(src_dir.rglob("*.ts")) + list(src_dir.rglob("*.tsx"))

        for ts_file in ts_files:
            try:
                content = ts_file.read_text()

                # Find all import statements
                imports = re.findall(r'import\s+{([^}]+)}\s+from', content)
                imported_names = set()
                for imp in imports:
                    imported_names.update(name.strip().split(','))

                # Also check default imports
                default_imports = re.findall(r'import\s+(\w+)\s+from', content)
                imported_names.update(default_imports)

                # Find all used identifiers (basic check)
                used = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b', content)
                used_set = set(used)

                # Check for common undefined variables
                undefined = used_set - imported_names - self._get_builtins()

                # Filter false positives
                undefined = {u for u in undefined if len(u) > 2 and not u[0].isupper()}

                if undefined:
                    self.warnings[str(ts_file)].append(
                        f"Possible undefined: {', '.join(sorted(undefined)[:5])}"
                    )
            except Exception as e:
                self.issues[str(ts_file)].append(f"Parse error: {e}")

    def check_dead_components(self):
        """Find components that are defined but never imported."""
        components_dir = self.repo_path / "src" / "components"

        if not components_dir.exists():
            return

        # Find all .tsx files
        components = {}
        for tsx_file in components_dir.rglob("*.tsx"):
            component_name = tsx_file.stem
            components[component_name] = str(tsx_file)

        # Find all imports across the project
        src_dir = self.repo_path / "src"
        all_imports = set()

        for ts_file in src_dir.rglob("*.ts*"):
            try:
                content = ts_file.read_text()
                # Find component imports
                imports = re.findall(r'import\s+(?:{\s*)?(\w+)', content)
                all_imports.update(imports)
            except:
                pass

        # Find unused components
        for component_name, path in components.items():
            if component_name not in all_imports:
                self.warnings["Dead Components"].append(
                    f"{component_name} ({path}) - never imported"
                )

    def check_broken_exports(self):
        """Find exports that don't exist or exports from files without them."""
        src_dir = self.repo_path / "src"

        for ts_file in src_dir.rglob("*.ts*"):
            try:
                content = ts_file.read_text()

                # Find all imports from local files
                local_imports = re.findall(
                    r"import\s+{([^}]+)}\s+from\s+['\"]([^'\"]+)['\"]",
                    content
                )

                for imports, path in local_imports:
                    # Skip node_modules and external imports
                    if path.startswith('.'):
                        target_path = (ts_file.parent / path).resolve()

                        # Try to find the target file
                        possible_files = [
                            target_path,
                            target_path.with_suffix('.ts'),
                            target_path.with_suffix('.tsx'),
                            target_path / 'index.ts',
                            target_path / 'index.tsx',
                        ]

                        found = any(f.exists() for f in possible_files)

                        if not found:
                            self.issues[str(ts_file)].append(
                                f"Broken import: {path}"
                            )
            except Exception as e:
                pass

    def check_asin_validity(self):
        """Validate ASIN format (10-char alphanumeric)."""
        seed_file = self.repo_path / "data" / "asin-seed.json"

        if not seed_file.exists():
            self.warnings["ASIN Check"].append("asin-seed.json not found")
            return

        try:
            with open(seed_file) as f:
                data = json.load(f)

            invalid_asins = []
            all_asins = []

            for category, products in data.get("products", {}).items():
                if isinstance(products, list):
                    for product in products:
                        asin = product.get("asin", "")
                        all_asins.append(asin)

                        # Check format: 10 alphanumeric characters
                        if not re.match(r'^[A-Z0-9]{10}$', asin):
                            invalid_asins.append({
                                'asin': asin,
                                'product': product.get('title', 'Unknown'),
                                'category': category
                            })

            if invalid_asins:
                for item in invalid_asins:
                    self.issues["ASIN Validity"].append(
                        f"{item['asin']} ({item['product']}) - Invalid format"
                    )
            else:
                self.info["ASIN Validity"].append(
                    f"✅ All {len(all_asins)} ASINs valid"
                )
        except json.JSONDecodeError as e:
            self.issues["ASIN Check"].append(f"Invalid JSON: {e}")

    def check_json_schemas(self):
        """Validate JSON files against expected schemas."""
        json_files = [
            ("data/asin-seed.json", ["version", "mode", "products"]),
        ]

        for json_path, required_fields in json_files:
            full_path = self.repo_path / json_path

            if not full_path.exists():
                self.warnings["JSON Schemas"].append(f"{json_path} not found")
                continue

            try:
                with open(full_path) as f:
                    data = json.load(f)

                # Check required fields
                missing = [f for f in required_fields if f not in data]

                if missing:
                    self.issues["JSON Schemas"].append(
                        f"{json_path}: missing fields {missing}"
                    )
                else:
                    self.info["JSON Schemas"].append(
                        f"✅ {json_path} schema valid"
                    )
            except json.JSONDecodeError as e:
                self.issues["JSON Schemas"].append(
                    f"{json_path}: {e}"
                )

    def check_duplicate_products(self):
        """Find duplicate products (by ASIN) in seed data."""
        seed_file = self.repo_path / "data" / "asin-seed.json"

        if not seed_file.exists():
            return

        try:
            with open(seed_file) as f:
                data = json.load(f)

            asin_map = defaultdict(list)

            for category, products in data.get("products", {}).items():
                if isinstance(products, list):
                    for idx, product in enumerate(products):
                        asin = product.get("asin", "")
                        if asin:
                            asin_map[asin].append({
                                'category': category,
                                'index': idx,
                                'title': product.get('title', 'Unknown')
                            })

            duplicates = {asin: items for asin, items in asin_map.items() if len(items) > 1}

            if duplicates:
                for asin, items in duplicates.items():
                    categories = ', '.join([f"{i['category']}[{i['index']}]" for i in items])
                    self.issues["Duplicate Products"].append(
                        f"{asin}: {items[0]['title']} appears in {categories}"
                    )
            else:
                all_products = sum(len(p) if isinstance(p, list) else 1
                                  for p in data.get("products", {}).values())
                self.info["Duplicate Products"].append(
                    f"✅ No duplicates found ({all_products} products)"
                )
        except Exception as e:
            self.issues["Duplicate Products"].append(f"Check failed: {e}")

    def print_report(self):
        """Print formatted report."""
        print("\n📋 HEALTH SCAN REPORT")
        print("=" * 70)

        # Issues (critical)
        if self.issues:
            print("\n❌ ISSUES (Critical):")
            for category, items in self.issues.items():
                print(f"\n  {category}:")
                for item in items[:5]:  # Show first 5
                    print(f"    • {item}")
                if len(items) > 5:
                    print(f"    ... and {len(items) - 5} more")

        # Warnings
        if self.warnings:
            print("\n⚠️ WARNINGS:")
            for category, items in self.warnings.items():
                print(f"\n  {category}:")
                for item in items[:3]:  # Show first 3
                    print(f"    • {item}")
                if len(items) > 3:
                    print(f"    ... and {len(items) - 3} more")

        # Info (pass checks)
        if self.info:
            print("\n✅ PASSED:")
            for category, items in self.info.items():
                for item in items:
                    print(f"  {item}")

        # Summary
        total_issues = sum(len(v) for v in self.issues.values())
        total_warnings = sum(len(v) for v in self.warnings.values())

        print("\n" + "=" * 70)
        if total_issues == 0 and total_warnings == 0:
            print("🟢 REPO HEALTH: EXCELLENT")
            return 0
        elif total_issues == 0:
            print(f"🟡 REPO HEALTH: GOOD ({total_warnings} warnings)")
            return 0
        else:
            print(f"🔴 REPO HEALTH: NEEDS ATTENTION ({total_issues} issues, {total_warnings} warnings)")
            return 1

    @staticmethod
    def _get_builtins() -> Set[str]:
        """Return common JavaScript/TypeScript built-ins."""
        return {
            'console', 'Math', 'Object', 'Array', 'String', 'Number', 'Boolean',
            'Date', 'RegExp', 'JSON', 'Promise', 'async', 'await',
            'function', 'class', 'export', 'import', 'const', 'let', 'var',
            'if', 'else', 'for', 'while', 'return', 'true', 'false', 'null',
            'undefined', 'this', 'super', 'extends', 'static', 'public', 'private',
            'readonly', 'interface', 'type', 'enum', 'abstract', 'declare',
            'typeof', 'instanceof', 'new', 'delete', 'void', 'try', 'catch',
            'finally', 'throw', 'switch', 'case', 'break', 'continue',
            'React', 'ReactDOM', 'useState', 'useEffect', 'useContext', 'useRef',
            'next', 'Image', 'Link', 'router', 'path', 'fs', 'http', 'url',
        }

def main():
    repo_path = sys.argv[1] if len(sys.argv) > 1 else "."

    scanner = DXMRepoScanner(repo_path)
    exit_code = scanner.scan_all()

    sys.exit(exit_code)

if __name__ == "__main__":
    main()
