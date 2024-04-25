/*
 * Copyright Intern MSIB6 @ PT Len Industri (Persero)
 *
 * THIS SOFTWARE SOURCE CODE AND ANY EXECUTABLE DERIVED THEREOF ARE PROPRIETARY
 * TO PT LEN INDUSTRI (PERSERO), AS APPLICABLE, AND SHALL NOT BE USED IN ANY WAY
 * OTHER THAN BEFOREHAND AGREED ON BY PT LEN INDUSTRI (PERSERO), NOR BE REPRODUCED
 * OR DISCLOSED TO THIRD PARTIES WITHOUT PRIOR WRITTEN AUTHORIZATION BY
 * PT LEN INDUSTRI (PERSERO), AS APPLICABLE.
 *
 * Created Date: Thursday, April 25th 2024, 10:25:38 am
 * Author: Annisa Nailiya Zahroh | annisanailiyazahroh02@gmail.com <https://github.com/annisanailiya>
 *
 */

/**
 * @file This file contains the Tooltip component which is responsible for rendering a tooltip.
 * @copyright Intern MSIB6 @ PT Len Industri (Persero)
 */

export const Button = ({ children, onClick }) => {
  return (
    <div onClick={onClick}>
      <button className="p-1 bg-gray-500 hover:bg-gray-700 rounded-md mb-3 text-white">
        {children}
      </button>
    </div>
  );
};