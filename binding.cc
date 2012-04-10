#include <string.h>
#include <v8.h>
#include <node.h>
#include <node_buffer.h>

using namespace v8;
using namespace node;

static Persistent<String> int8_symbol;
static Persistent<String> uint8_symbol;
static Persistent<String> int16_symbol;
static Persistent<String> uint16_symbol;
static Persistent<String> int32_symbol;
static Persistent<String> uint32_symbol;
static Persistent<String> float_symbol;
static Persistent<String> double_symbol;
static Persistent<String> pixel_symbol;

Handle<Value> MakeFastBuffer(const Arguments& args) {
  HandleScope scope;

  if (!Buffer::HasInstance(args[1])) {
    return ThrowException(Exception::TypeError(String::New(
            "Argument must be a Buffer")));
  }

  Local<Object> fast_buffer = args[0]->ToObject();
  char* data = Buffer::Data(args[1]->ToObject());
  uint32_t offset = args[2]->Uint32Value();
  Local<Value> type_arg = args[3];
  uint32_t length = args[4]->Uint32Value();

  enum ExternalArrayType type = kExternalUnsignedByteArray;
  if (!type_arg->IsUndefined()) {
    size_t type_size = 1;
    if (type_arg->StrictEquals(int8_symbol)) {
      type = kExternalByteArray;
      type_size = 1;
    }
    else if (type_arg->StrictEquals(uint8_symbol)) {
      type = kExternalUnsignedByteArray;
      type_size = 1;
    }
    else if (type_arg->StrictEquals(int16_symbol)) {
      type = kExternalShortArray;
      type_size = 2;
    }
    else if (type_arg->StrictEquals(uint16_symbol)) {
      type = kExternalUnsignedShortArray;
      type_size = 2;
    }
    else if (type_arg->StrictEquals(int32_symbol)) {
      type = kExternalIntArray;
      type_size = 4;
    }
    else if (type_arg->StrictEquals(uint32_symbol)) {
      type = kExternalUnsignedIntArray;
      type_size = 4;
    }
    else if (type_arg->StrictEquals(float_symbol)) {
      type = kExternalFloatArray;
      type_size = 4;
    }
    else if (type_arg->StrictEquals(double_symbol)) {
      type = kExternalDoubleArray;
      type_size = 8;
    }
    else if (type_arg->StrictEquals(pixel_symbol)) {
      type = kExternalPixelArray;
      type_size = 1;
    }

    if ((offset & (type_size - 1)) != 0) {
      return ThrowException(Exception::Error(
            String::New("Byte offset is not aligned.")));
    }
  }

  fast_buffer->SetIndexedPropertiesToExternalArrayData(
      data + offset, type, length);

  return Undefined();
}

void Initialize(Handle<Object> target) {
  int8_symbol   = NODE_PSYMBOL("int8");
  uint8_symbol  = NODE_PSYMBOL("uint8");
  int16_symbol  = NODE_PSYMBOL("int16");
  uint16_symbol = NODE_PSYMBOL("uint16");
  int32_symbol  = NODE_PSYMBOL("int32");
  uint32_symbol = NODE_PSYMBOL("uint32");
  float_symbol  = NODE_PSYMBOL("float");
  double_symbol = NODE_PSYMBOL("double");
  pixel_symbol  = NODE_PSYMBOL("pixel");

  NODE_SET_METHOD(target, "makeFastBuffer", MakeFastBuffer);
}

NODE_MODULE(binding, Initialize);
