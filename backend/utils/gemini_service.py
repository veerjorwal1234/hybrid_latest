import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_attendance_report(attendance_data):
    """
    Generate an intelligent report using Gemini AI based on attendance data.
    
    Args:
        attendance_data: List of attendance records with student info, status, timestamps, etc.
    
    Returns:
        dict: Report with summary, insights, and recommendations
    """
    
    # Initialize Gemini model
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Format attendance data for Gemini
    data_summary = f"Total records: {len(attendance_data)}\n\n"
    
    # Calculate statistics
    status_counts = {}
    for record in attendance_data:
        status = record.get('status', 'Unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    data_summary += "Status Distribution:\n"
    for status, count in status_counts.items():
        data_summary += f"- {status}: {count}\n"
    
    data_summary += '\nDetailed Records:\n'
    for i, record in enumerate(attendance_data[:50], 1):  # Limit to 50 records to avoid token limits
        data_summary += f"{i}. Student: {record.get('student_name', 'Unknown')}, "
        data_summary += f"Status: {record['status']}, "
        data_summary += f"GPS Accuracy: {record['inside_count']}/{record['total_samples']} samples inside, "
        data_summary += f"Date: {record.get('date', 'N/A')}\n"
    
    # Create the prompt for Gemini
    prompt = f"""You are an intelligent attendance analysis assistant for a smart attendance system that uses GPS and QR codes.

Analyze the following attendance data and provide:
1. A brief summary (2-3 sentences)
2. Key insights (3-5 bullet points about patterns, trends, or notable observations)
3. Actionable recommendations (3-4 suggestions for improving attendance or system usage)

Attendance Data:
{data_summary}

Note: 
- "Present" means 8+ GPS samples were inside the geofence
- "Late" means 5-7 samples were inside
- "Short" means 2-4 samples were inside
- "Invalid Attempt" means fewer than 2 samples were inside

Provide your analysis in a structured format with clear sections."""

    try:
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Parse the response
        report_text = response.text
        
        # Improved parsing logic
        sections = {
            'summary': '',
            'insights': [],
            'recommendations': []
        }
        
        lines = report_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Skip markdown headers and detect sections
            if line.startswith('###') or line.startswith('##'):
                line = line.lstrip('#').strip()
            
            # Detect sections (more flexible matching)
            lower_line = line.lower()
            if 'brief summary' in lower_line or (current_section is None and 'summary' in lower_line and ':' in line):
                current_section = 'summary'
                # Extract summary if it's on the same line
                if ':' in line:
                    summary_text = line.split(':', 1)[1].strip()
                    if summary_text:
                        sections['summary'] = summary_text
                continue
            elif 'key insight' in lower_line or 'insights' in lower_line:
                current_section = 'insights'
                continue
            elif 'recommendation' in lower_line or 'actionable' in lower_line:
                current_section = 'recommendations'
                continue
            
            # Add content to current section
            if current_section == 'summary':
                # Continue building summary
                if not line.startswith('*') and not line.startswith('-') and not line[0:2].isdigit():
                    sections['summary'] += ' ' + line
            elif current_section == 'insights':
                # Extract bullet points
                if line.startswith('*') or line.startswith('-') or line.startswith('+'):
                    clean_line = line.lstrip('*-+ ').strip()
                    if clean_line:
                        sections['insights'].append(clean_line)
                elif line[0:2].replace('.', '').isdigit():  # Numbered list
                    clean_line = line.split('.', 1)[1].strip() if '.' in line else line[2:].strip()
                    if clean_line:
                        sections['insights'].append(clean_line)
            elif current_section == 'recommendations':
                # Extract bullet points
                if line.startswith('*') or line.startswith('-') or line.startswith('+'):
                    clean_line = line.lstrip('*-+ ').strip()
                    if clean_line:
                        sections['recommendations'].append(clean_line)
                elif line[0:2].replace('.', '').isdigit():  # Numbered list
                    clean_line = line.split('.', 1)[1].strip() if '.' in line else line[2:].strip()
                    if clean_line:
                        sections['recommendations'].append(clean_line)
        
        # Clean up summary
        sections['summary'] = sections['summary'].strip()
        
        # If sections are empty, provide fallback
        if not sections['summary']:
            sections['summary'] = "The AI has analyzed your attendance data. See the full response below for details."
        
        if not sections['insights']:
            sections['insights'] = [
                "Check the full AI response below for detailed insights.",
                "The attendance data shows patterns that require review."
            ]
        
        if not sections['recommendations']:
            sections['recommendations'] = [
                "Review the full AI response for personalized recommendations.",
                "Continue monitoring attendance patterns regularly."
            ]
        
        sections['raw_response'] = report_text
        
        return {
            'success': True,
            'report': sections
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'report': {
                'summary': 'Failed to generate AI report.',
                'insights': ['Error occurred while processing attendance data.'],
                'recommendations': ['Please try again later.']
            }
        }
