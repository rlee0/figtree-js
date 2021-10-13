import React, { useEffect, useState } from "react"

import DataLoader from "../DataLoader/DataLoader"
import { RecoilRoot } from "recoil"
import _isEmpty from "lodash/isEmpty"
import _isEqual from "lodash/isEqual"

const Root = ({ override, children, ...config }) => {
  return (
    <RecoilRoot override={override}>
      <DataLoader {...config}>{children}</DataLoader>
    </RecoilRoot>
  )
}

export default Root
