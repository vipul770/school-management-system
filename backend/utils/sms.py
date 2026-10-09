"""SMS delivery adapters for AWS SNS or Twilio, configured only in deployment secrets."""
import os

def send_sms(recipient: str, message: str) -> str:
    provider = os.getenv("SMS_PROVIDER", "").lower()
    if provider == "sns":
        import boto3
        response = boto3.client("sns", region_name=os.getenv("AWS_REGION")).publish(PhoneNumber=recipient, Message=message)
        return response["MessageId"]
    if provider == "twilio":
        from twilio.rest import Client
        client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
        return client.messages.create(to=recipient, from_=os.environ["TWILIO_FROM_NUMBER"], body=message).sid
    raise RuntimeError("Configure SMS_PROVIDER as 'sns' or 'twilio' to send SMS messages.")
