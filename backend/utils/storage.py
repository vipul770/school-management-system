from django.core.files.storage import default_storage

def save_upload(path, uploaded_file):
    return default_storage.save(path, uploaded_file)
