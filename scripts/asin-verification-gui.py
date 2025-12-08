#!/usr/bin/env python3
"""
DXM369 ASIN Verification & Management GUI
Validates Amazon ASINs, checks product metadata, and manages seed data
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import requests
import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import threading
from queue import Queue
from html.parser import HTMLParser
from pathlib import Path

@dataclass
class ValidationResult:
    asin: str
    status_code: int
    title: str
    is_gpu: bool
    price: Optional[float] = None
    brand: Optional[str] = None
    vram: Optional[str] = None
    notes: str = ""
    valid: bool = False

class ASINVerifier:
    """Validates Amazon ASINs and extracts product metadata"""

    GPU_KEYWORDS = ['graphics card', 'gpu', 'nvidia', 'amd', 'geforce', 'radeon', 'rtx', 'rx', 'gtx']

    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    def validate_asin(self, asin: str) -> ValidationResult:
        """Validate an ASIN and extract metadata"""
        url = f"https://www.amazon.com/dp/{asin}"

        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            title = self._extract_title(response.text)
            is_gpu = any(kw in title.lower() for kw in self.GPU_KEYWORDS)
            price = self._extract_price(response.text)
            brand = self._extract_brand(title)
            vram = self._extract_vram(title)

            notes = ""
            if response.status_code == 404:
                notes = "Product not found (404)"
                valid = False
            elif response.status_code == 200 and is_gpu:
                notes = "Valid GPU product"
                valid = True
            elif response.status_code == 200:
                notes = f"Found but not GPU: {title[:30]}..."
                valid = False
            else:
                notes = f"HTTP {response.status_code}"
                valid = False

            return ValidationResult(
                asin=asin,
                status_code=response.status_code,
                title=title,
                is_gpu=is_gpu,
                price=price,
                brand=brand,
                vram=vram,
                notes=notes,
                valid=valid
            )

        except requests.Timeout:
            return ValidationResult(asin=asin, status_code=0, title="Error", is_gpu=False,
                                   notes="Request timeout")
        except Exception as e:
            return ValidationResult(asin=asin, status_code=0, title="Error", is_gpu=False,
                                   notes=f"Error: {str(e)[:50]}")

    def _extract_title(self, html: str) -> str:
        """Extract product title from HTML"""
        match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
        return match.group(1).strip() if match else "No title"

    def _extract_price(self, html: str) -> Optional[float]:
        """Extract price from HTML"""
        match = re.search(r'\$?([\d,]+\.?\d*)', html)
        if match:
            try:
                return float(match.group(1).replace(',', ''))
            except:
                return None
        return None

    def _extract_brand(self, title: str) -> str:
        """Extract brand from title"""
        brands = ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'PowerColor', 'Sapphire', 'XFX', 'ASRock', 'PNY', 'Palit', 'Zotac']
        for brand in brands:
            if brand.lower() in title.lower():
                return brand
        return title.split()[0] if title else "Unknown"

    def _extract_vram(self, title: str) -> str:
        """Extract VRAM from title"""
        match = re.search(r'(\d+)\s*GB', title, re.IGNORECASE)
        return f"{match.group(1)}GB" if match else "Unknown"

class ASINVerificationGUI:
    """GUI for ASIN verification and seed data management"""

    def __init__(self, root):
        self.root = root
        self.root.title("DXM369 ASIN Verification Tool")
        self.root.geometry("1200x700")
        self.root.configure(bg="#0a1124")

        self.verifier = ASINVerifier()
        self.results: List[ValidationResult] = []
        self.validation_queue = Queue()

        self.setup_ui()

    def setup_ui(self):
        """Setup the user interface"""
        # Main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Title
        title_label = tk.Label(
            main_frame,
            text="🛰️ DXM369 GPU ASIN Verification Tool",
            font=("Courier", 16, "bold"),
            bg="#0a1124",
            fg="#00d9ff"
        )
        title_label.pack(pady=10)

        # Input frame
        input_frame = ttk.LabelFrame(main_frame, text="Input ASINs", padding=10)
        input_frame.pack(fill=tk.X, pady=10)

        ttk.Label(input_frame, text="Paste ASINs (one per line):").pack(anchor=tk.W)
        self.input_text = tk.Text(input_frame, height=4, width=80, font=("Courier", 10))
        self.input_text.pack(fill=tk.X, pady=5)

        button_frame = ttk.Frame(input_frame)
        button_frame.pack(fill=tk.X, pady=5)

        ttk.Button(button_frame, text="🔍 Validate", command=self.start_validation).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="📁 Load File", command=self.load_asin_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="💾 Save Results", command=self.save_results).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="📂 Open Folder", command=self.open_output_folder).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="🌱 Inject to Seed", command=self.inject_to_seed).pack(side=tk.LEFT, padx=5)

        # Results frame
        results_frame = ttk.LabelFrame(main_frame, text="Validation Results", padding=10)
        results_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        # Treeview for results
        columns = ("ASIN", "Status", "Title", "Brand", "VRAM", "Price", "Valid", "Notes")
        self.tree = ttk.Treeview(results_frame, columns=columns, height=15)

        # Define column headings
        self.tree.heading("#0", text="")
        for col in columns:
            self.tree.heading(col, text=col)
            width = 80 if col == "Title" else 50 if col == "Notes" else 100
            self.tree.column(col, width=width)

        # Scrollbars
        vsb = ttk.Scrollbar(results_frame, orient=tk.VERTICAL, command=self.tree.yview)
        hsb = ttk.Scrollbar(results_frame, orient=tk.HORIZONTAL, command=self.tree.xview)
        self.tree.configure(yscroll=vsb.set, xscroll=hsb.set)

        self.tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")

        results_frame.columnconfigure(0, weight=1)
        results_frame.rowconfigure(0, weight=1)

        # Status frame
        status_frame = ttk.Frame(main_frame)
        status_frame.pack(fill=tk.X, pady=10)

        self.status_var = tk.StringVar(value="Ready")
        self.status_label = ttk.Label(status_frame, textvariable=self.status_var)
        self.status_label.pack(side=tk.LEFT)

        self.progress = ttk.Progressbar(status_frame, mode='indeterminate')
        self.progress.pack(side=tk.RIGHT, fill=tk.X, expand=True, padx=5)

        # Configure tag colors
        self.tree.tag_configure("valid", foreground="green")
        self.tree.tag_configure("invalid", foreground="red")

    def start_validation(self):
        """Start validation of entered ASINs"""
        asin_text = self.input_text.get("1.0", tk.END).strip()
        asins = [line.strip().upper() for line in asin_text.split('\n') if line.strip()]

        if not asins:
            messagebox.showwarning("Input Error", "Please enter at least one ASIN")
            return

        # Clear previous results
        for item in self.tree.get_children():
            self.tree.delete(item)
        self.results = []

        # Start validation in background thread
        self.progress.start()
        self.status_var.set(f"Validating {len(asins)} ASINs...")

        thread = threading.Thread(target=self._validate_asins, args=(asins,))
        thread.daemon = True
        thread.start()

    def _validate_asins(self, asins: List[str]):
        """Validate ASINs in background thread"""
        for i, asin in enumerate(asins):
            result = self.verifier.validate_asin(asin)
            self.results.append(result)

            # Update UI
            tag = "valid" if result.valid else "invalid"
            self.tree.insert("", "end", values=(
                result.asin,
                result.status_code,
                result.title[:40] + "..." if len(result.title) > 40 else result.title,
                result.brand or "-",
                result.vram or "-",
                f"${result.price:.2f}" if result.price else "-",
                "✅" if result.valid else "❌",
                result.notes[:30] + "..." if len(result.notes) > 30 else result.notes
            ), tags=(tag,))

            # Update status
            self.status_var.set(f"Validated {i+1}/{len(asins)}")
            self.root.update()

        self.progress.stop()
        valid_count = sum(1 for r in self.results if r.valid)
        self.status_var.set(f"✅ Complete: {valid_count}/{len(asins)} valid GPUs")

    def load_asin_file(self):
        """Load ASINs from file"""
        filename = filedialog.askopenfilename(
            filetypes=[("Text files", "*.txt"), ("JSON files", "*.json"), ("All files", "*.*")]
        )
        if not filename:
            return

        try:
            with open(filename, 'r') as f:
                content = f.read()

            if filename.endswith('.json'):
                data = json.loads(content)
                if isinstance(data, list):
                    asins = data
                elif isinstance(data, dict) and 'gpu' in data:
                    asins = [gpu['asin'] for gpu in data['gpu']]
                else:
                    asins = list(data.values()) if isinstance(data, dict) else []
                content = '\n'.join(asins)

            self.input_text.delete("1.0", tk.END)
            self.input_text.insert("1.0", content)
            messagebox.showinfo("Success", f"Loaded {len(content.split())} ASINs")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to load file: {str(e)}")

    def save_results(self):
        """Save validation results"""
        if not self.results:
            messagebox.showwarning("No Data", "No validation results to save")
            return

        filename = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("CSV files", "*.csv")]
        )
        if not filename:
            return

        try:
            if filename.endswith('.json'):
                data = [
                    {
                        'asin': r.asin,
                        'status_code': r.status_code,
                        'title': r.title,
                        'is_gpu': r.is_gpu,
                        'valid': r.valid,
                        'price': r.price,
                        'brand': r.brand,
                        'vram': r.vram,
                        'notes': r.notes
                    }
                    for r in self.results
                ]
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)
            else:
                import csv
                with open(filename, 'w', newline='') as f:
                    writer = csv.DictWriter(f, fieldnames=['asin', 'status_code', 'title', 'is_gpu', 'valid', 'price', 'brand', 'vram', 'notes'])
                    writer.writeheader()
                    for r in self.results:
                        writer.writerow({
                            'asin': r.asin,
                            'status_code': r.status_code,
                            'title': r.title,
                            'is_gpu': r.is_gpu,
                            'valid': r.valid,
                            'price': r.price,
                            'brand': r.brand,
                            'vram': r.vram,
                            'notes': r.notes
                        })

            messagebox.showinfo("Success", f"Results saved to {filename}")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to save results: {str(e)}")

    def open_output_folder(self):
        """Open the exports folder in file manager"""
        try:
            import subprocess
            import platform

            exports_path = "exports"

            # Create exports folder if not exists
            Path(exports_path).mkdir(exist_ok=True)

            system = platform.system()
            if system == "Darwin":  # macOS
                subprocess.Popen(["open", exports_path])
            elif system == "Windows":
                import os
                os.startfile(exports_path)
            else:  # Linux
                subprocess.Popen(["xdg-open", exports_path])

            messagebox.showinfo("Success", f"Opened: {Path(exports_path).absolute()}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to open folder: {str(e)}")

    def inject_to_seed(self):
        """Inject valid results into seed data"""
        valid_results = [r for r in self.results if r.valid]

        if not valid_results:
            messagebox.showwarning("No Valid GPUs", "No valid GPU products to inject")
            return

        try:
            # Load current seed file
            seed_path = "data/asin-seed.json"
            with open(seed_path, 'r') as f:
                seed_data = json.load(f)

            # Create GPU products from results
            new_gpus = []
            for result in valid_results:
                gpu = {
                    "asin": result.asin,
                    "title": result.title,
                    "brand": result.brand or "Unknown",
                    "category": "gpu",
                    "price": int(result.price) if result.price else 299,
                    "previousPrice": int(result.price * 1.2) if result.price else 399,
                    "dxmScore": 8.5,  # Default score
                    "vram": result.vram or "8GB",
                    "tdp": "200W",  # Default TDP
                    "boostClock": "2.5 GHz",
                    "baseClock": "2.0 GHz",
                    "imageUrl": f"/images/products/gpus/{result.brand.lower().replace(' ', '_')}_gpu.svg",
                    "domain": "com",
                    "tags": ["gpu", "validated"],
                    "availability": "In Stock",
                    "primeEligible": True,
                    "vendor": "Amazon",
                    "affiliateUrl": f"https://www.amazon.com/dp/{result.asin}/?tag=dxm369-20"
                }
                new_gpus.append(gpu)

            # Update seed data
            seed_data['products']['gpu'] = new_gpus
            seed_data['lastUpdated'] = __import__('datetime').date.today().isoformat()

            # Save updated seed data
            with open(seed_path, 'w') as f:
                json.dump(seed_data, f, indent=2)

            messagebox.showinfo("Success", f"Injected {len(new_gpus)} GPU products into seed data")

        except FileNotFoundError:
            messagebox.showerror("Error", "Could not find data/asin-seed.json")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to inject data: {str(e)}")

def main():
    root = tk.Tk()
    app = ASINVerificationGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
