#!/usr/bin/env python3
"""
Fix all data inconsistencies in the Simplify Slovakia data files.

This script:
1. Changes 'jurisdiction' to 'country' in all steps
2. Ensures consistent field naming
3. Validates schema compliance
4. Creates a report of changes made
"""

import yaml
import os
from pathlib import Path
from typing import Dict, List, Any

class DataFixer:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.steps_dir = self.data_dir / 'steps'
        self.flows_dir = self.data_dir / 'flows'
        self.changes = []
        self.errors = []
        
    def fix_step_file(self, step_path: Path) -> Dict[str, Any]:
        """Fix a single step file and return the corrected data."""
        with open(step_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        original_data = data.copy()
        changed = False
        
        # Fix 1: Change 'jurisdiction' to 'country'
        if 'jurisdiction' in data:
            data['country'] = data.pop('jurisdiction')
            changed = True
            self.changes.append(f"{step_path.name}: Changed 'jurisdiction' to 'country'")
        
        # Fix 2: Ensure 'country' is 'Slovakia'
        if 'country' in data and data['country'] != 'Slovakia':
            old_value = data['country']
            data['country'] = 'Slovakia'
            changed = True
            self.changes.append(f"{step_path.name}: Standardized country value '{old_value}' -> 'Slovakia'")
        
        # Fix 3: Ensure 'applies_to' has 'persona' not 'persona_id'
        if 'applies_to' in data:
            if 'persona_id' in data['applies_to']:
                data['applies_to']['persona'] = data['applies_to'].pop('persona_id')
                changed = True
                self.changes.append(f"{step_path.name}: Changed 'persona_id' to 'persona' in applies_to")
        
        # Fix 4: Remove 'order' field if it exists (belongs in flow, not step)
        if 'order' in data:
            order_value = data.pop('order')
            changed = True
            self.changes.append(f"{step_path.name}: Removed 'order' field (value was {order_value})")
        
        # Fix 5: Ensure preconditions is a list
        if 'preconditions' in data:
            if not isinstance(data['preconditions'], list):
                data['preconditions'] = [data['preconditions']]
                changed = True
                self.changes.append(f"{step_path.name}: Converted preconditions to list")
        
        # Fix 6: Ensure outputs is a list
        if 'outputs' in data:
            if not isinstance(data['outputs'], list):
                data['outputs'] = [data['outputs']]
                changed = True
                self.changes.append(f"{step_path.name}: Converted outputs to list")
        
        return data, changed
    
    def fix_flow_file(self, flow_path: Path) -> Dict[str, Any]:
        """Fix a single flow file and return the corrected data."""
        with open(flow_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        changed = False
        
        # Fix 1: Ensure 'persona_id' field exists (not just 'persona')
        if 'persona' in data and 'persona_id' not in data:
            data['persona_id'] = data.pop('persona')
            changed = True
            self.changes.append(f"{flow_path.name}: Changed 'persona' to 'persona_id'")
        
        # Fix 2: Ensure 'country' field exists and is 'Slovakia'
        if 'country' not in data:
            data['country'] = 'Slovakia'
            changed = True
            self.changes.append(f"{flow_path.name}: Added missing 'country' field")
        elif data['country'] != 'Slovakia':
            old_value = data['country']
            data['country'] = 'Slovakia'
            changed = True
            self.changes.append(f"{flow_path.name}: Standardized country '{old_value}' -> 'Slovakia'")
        
        # Fix 3: Ensure steps have sequential order
        if 'steps' in data:
            for idx, step in enumerate(data['steps'], 1):
                if 'order' not in step or step['order'] != idx:
                    old_order = step.get('order', 'missing')
                    step['order'] = idx
                    changed = True
                    self.changes.append(f"{flow_path.name}: Fixed step order {old_order} -> {idx}")
        
        return data, changed
    
    def validate_step(self, step_path: Path, data: Dict[str, Any]) -> List[str]:
        """Validate a step file and return list of errors."""
        errors = []
        required_fields = ['step_id', 'title', 'description', 'country', 'applies_to', 
                          'preconditions', 'outputs']
        
        for field in required_fields:
            if field not in data:
                errors.append(f"{step_path.name}: Missing required field '{field}'")
        
        if 'country' in data and data['country'] != 'Slovakia':
            errors.append(f"{step_path.name}: Country must be 'Slovakia', got '{data['country']}'")
        
        if 'applies_to' in data and 'persona' not in data['applies_to']:
            errors.append(f"{step_path.name}: applies_to must have 'persona' field")
        
        if 'order' in data:
            errors.append(f"{step_path.name}: Step files should not have 'order' field")
        
        return errors
    
    def validate_flow(self, flow_path: Path, data: Dict[str, Any]) -> List[str]:
        """Validate a flow file and return list of errors."""
        errors = []
        required_fields = ['flow_id', 'persona_id', 'country', 'version', 'steps']
        
        for field in required_fields:
            if field not in data:
                errors.append(f"{flow_path.name}: Missing required field '{field}'")
        
        if 'country' in data and data['country'] != 'Slovakia':
            errors.append(f"{flow_path.name}: Country must be 'Slovakia', got '{data['country']}'")
        
        if 'persona' in data and 'persona_id' not in data:
            errors.append(f"{flow_path.name}: Use 'persona_id' not 'persona'")
        
        if 'steps' in data:
            for idx, step in enumerate(data['steps'], 1):
                if 'step_id' not in step:
                    errors.append(f"{flow_path.name}: Step {idx} missing 'step_id'")
                if 'order' not in step:
                    errors.append(f"{flow_path.name}: Step {idx} missing 'order'")
                elif step['order'] != idx:
                    errors.append(f"{flow_path.name}: Step {idx} has wrong order {step['order']}")
        
        return errors
    
    def process_all_files(self, dry_run: bool = False):
        """Process all step and flow files."""
        print("=" * 80)
        print("SIMPLIFY SLOVAKIA - DATA FIX SCRIPT")
        print("=" * 80)
        print()
        
        # Process steps
        if self.steps_dir.exists():
            print(f"Processing steps from: {self.steps_dir}")
            step_files = list(self.steps_dir.glob('*.yaml'))
            print(f"Found {len(step_files)} step files")
            print()
            
            for step_file in step_files:
                if step_file.name == 'README.md':
                    continue
                    
                try:
                    data, changed = self.fix_step_file(step_file)
                    
                    # Validate
                    errors = self.validate_step(step_file, data)
                    self.errors.extend(errors)
                    
                    # Write back if changed and not dry run
                    if changed and not dry_run:
                        with open(step_file, 'w', encoding='utf-8') as f:
                            yaml.dump(data, f, default_flow_style=False, 
                                    allow_unicode=True, sort_keys=False)
                        print(f"✓ Fixed: {step_file.name}")
                    elif changed:
                        print(f"Would fix: {step_file.name}")
                        
                except Exception as e:
                    error_msg = f"{step_file.name}: Error processing - {str(e)}"
                    self.errors.append(error_msg)
                    print(f"✗ Error: {error_msg}")
        
        print()
        
        # Process flows
        if self.flows_dir.exists():
            print(f"Processing flows from: {self.flows_dir}")
            flow_files = list(self.flows_dir.glob('*.yaml'))
            print(f"Found {len(flow_files)} flow files")
            print()
            
            for flow_file in flow_files:
                if flow_file.name == 'README.md':
                    continue
                    
                try:
                    data, changed = self.fix_flow_file(flow_file)
                    
                    # Validate
                    errors = self.validate_flow(flow_file, data)
                    self.errors.extend(errors)
                    
                    # Write back if changed and not dry run
                    if changed and not dry_run:
                        with open(flow_file, 'w', encoding='utf-8') as f:
                            yaml.dump(data, f, default_flow_style=False,
                                    allow_unicode=True, sort_keys=False)
                        print(f"✓ Fixed: {flow_file.name}")
                    elif changed:
                        print(f"Would fix: {flow_file.name}")
                        
                except Exception as e:
                    error_msg = f"{flow_file.name}: Error processing - {str(e)}"
                    self.errors.append(error_msg)
                    print(f"✗ Error: {error_msg}")
        
        print()
        print("=" * 80)
        self.print_report()
    
    def print_report(self):
        """Print a summary report of changes and errors."""
        print("REPORT")
        print("=" * 80)
        print()
        
        print(f"Total changes made: {len(self.changes)}")
        if self.changes:
            print("\nChanges:")
            for change in self.changes[:20]:  # Show first 20
                print(f"  • {change}")
            if len(self.changes) > 20:
                print(f"  ... and {len(self.changes) - 20} more")
        
        print()
        print(f"Total errors found: {len(self.errors)}")
        if self.errors:
            print("\nErrors:")
            for error in self.errors:
                print(f"  ✗ {error}")
        
        print()
        if not self.errors:
            print("✓ All data files are now consistent!")
        else:
            print("⚠ Some errors need manual fixing")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Fix Simplify Slovakia data files')
    parser.add_argument('data_dir', help='Path to data directory')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be changed without modifying files')
    
    args = parser.parse_args()
    
    fixer = DataFixer(args.data_dir)
    fixer.process_all_files(dry_run=args.dry_run)
