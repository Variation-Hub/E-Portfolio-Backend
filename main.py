import pdfplumber
import re
import json

class PDFExtractor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.course_data = {
            "course_code": "",
            "course_name": "",
            "level": "",
            "sector": "",
            "internal_external": "",
            "qualification_type": "",
            "guided_learning_hours": "",
            "assessment_language": "",
            "recommended_minimum_age": "",
            "total_credits": "",
            "operational_start_date": "",
            "assessment_methods": "",
            "qualification_status": "",
            "overall_grading_type": "",
            "permitted_delivery_types": "",
            "brand_guidelines": "",
            "mandatory_units": [],
            "optional_units": []
        }
    
    def extract_text(self):
        """Extracts text from all pages of the PDF."""
        full_text = ""
        with pdfplumber.open(self.pdf_path) as pdf:
            for page in pdf.pages:
                full_text += page.extract_text() + "\n"
        return full_text
    
    def extract_metadata(self, text):
        """Extracts metadata like course code, title, and level using regex."""
        metadata_patterns = {
            "course_code": r"Qualification Number[:\s]*([A-Z0-9/]+)",
            "course_name": r"Qualification Title[:\s]*(.+)",
            "level": r"Level[:\s]*(\d+)",
            "sector": r"Sector[:\s]*(.+)",
            "internal_external": r"Internal/External[:\s]*(.+)",
            "qualification_type": r"Qualification Type[:\s]*(.+)",
            "guided_learning_hours": r"Guided Learning Hours[:\s]*(\d+)",
            "assessment_language": r"Assessment Language[:\s]*(.+)",
            "recommended_minimum_age": r"Recommended Minimum Age[:\s]*(\d+)",
            "total_credits": r"Total Credits[:\s]*(\d+)",
            "operational_start_date": r"Operational Start Date[:\s]*(.+)",
            "assessment_methods": r"Assessment Methods[:\s]*(.+)",
            "qualification_status": r"Qualification Status[:\s]*(.+)",
            "overall_grading_type": r"Overall Grading Type[:\s]*(.+)",
            "permitted_delivery_types": r"Permitted Delivery Types[:\s]*(.+)",
            "brand_guidelines": r"Brand Guidelines[:\s]*(.+)"
        }
        
        for key, pattern in metadata_patterns.items():
            match = re.search(pattern, text)
            if match:
                self.course_data[key] = match.group(1).strip()
    
    def extract_units(self, text):
        """Extracts the mandatory and optional units."""
        mandatory_units = []
        optional_units = []
        
        mandatory_section = re.search(r"Mandatory Units([\s\S]+?)(Optional Units|$)", text)
        optional_section = re.search(r"Optional Units([\s\S]+)$", text)

        if mandatory_section:
            mandatory_units = self.parse_units(mandatory_section.group(1))

        if optional_section:
            optional_units = self.parse_units(optional_section.group(1))

        self.course_data["mandatory_units"] = mandatory_units
        self.course_data["optional_units"] = optional_units

    def parse_units(self, unit_text):
        """Parses each unit block to extract relevant details."""
        units = []
        unit_pattern = re.compile(
            r"(?P<title>.+?)\s(?P<unit_ref>[A-Z0-9/]+)\s(?P<level>\d+)\s(?P<glh>\d+)\s(?P<credit_value>\d+)"
        )
        for line in unit_text.split("\n"):
            match = unit_pattern.search(line.strip())
            if match:
                units.append({
                    "unit_ref": match.group("unit_ref"),
                    "title": match.group("title"),
                    "level": match.group("level"),
                    "glh": match.group("glh"),
                    "credit_value": match.group("credit_value")
                })
        return units

    def save_to_json(self, output_path):
        """Saves the extracted course data to a JSON file."""
        with open(output_path, 'w', encoding='utf-8') as json_file:
            json.dump(self.course_data, json_file, indent=2)
    
    def extract_and_save(self, output_path):
        """Main method to extract data and save it to a JSON file."""
        text = self.extract_text()
        self.extract_metadata(text)
        self.extract_units(text)
        self.save_to_json(output_path)

if __name__ == "__main__":
    pdf_path = "n1.pdf"  # PDF path
    output_path = "course_data.json"  # Output JSON file path

    extractor = PDFExtractor(pdf_path)
    extractor.extract_and_save(output_path)

    print(f"Data extracted and saved to {output_path}")
