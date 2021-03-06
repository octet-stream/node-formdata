import {deprecate} from "util"

import isReadStream from "./isReadStream"

function deprecateReadStream(
  _t: unknown,
  _k: string,
  descriptor: PropertyDescriptor
) {
  let fn = descriptor.value
  let decorated = false

  descriptor.value = function (...args: any[]) {
    if (isReadStream(args[1]) && !decorated) {
      decorated = true

      fn = deprecate(
        fn,

        "The usage of ReadStream in entry's value is deprecated. "
          + "Use Blob, File, fileFromPath or fileFromPathSync() instead."
      )
    }

    return fn.apply(this, args)
  }
}

export default deprecateReadStream
