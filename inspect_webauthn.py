from webauthn.helpers.structs import RegistrationCredential
import pydantic

print(f"Pydantic version: {pydantic.VERSION}")
print(f"RegistrationCredential type: {type(RegistrationCredential)}")
print(f"Has parse_raw: {hasattr(RegistrationCredential, 'parse_raw')}")
print(f"Has model_validate_json: {hasattr(RegistrationCredential, 'model_validate_json')}")
print(f"Dir: {dir(RegistrationCredential)}")
