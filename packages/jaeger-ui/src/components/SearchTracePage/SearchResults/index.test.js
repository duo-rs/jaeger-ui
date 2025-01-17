// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedSearchResults as SearchResults } from '.';
import * as markers from './index.markers';
import DiffSelection from './DiffSelection';
import ResultItem from './ResultItem';
import ScatterPlot from './ScatterPlot';
import LoadingIndicator from '../../common/LoadingIndicator';

describe('<SearchResults>', () => {
  let wrapper;
  let traces;
  let props;

  beforeEach(() => {
    traces = [{ traceID: 'a', spans: [], processes: {} }, { traceID: 'b', spans: [], processes: {} }];
    props = {
      diffCohort: [],
      goToTrace: () => {},
      location: {},
      loading: false,
      maxTraceDuration: 1,
      queryOfResults: {},
      traces,
    };
    wrapper = shallow(<SearchResults {...props} />);
  });

  it('shows the "no results" message when the search result is empty', () => {
    wrapper.setProps({ traces: [] });
    expect(wrapper.find(`[data-test="${markers.NO_RESULTS}"]`).length).toBe(1);
  });

  it('shows a loading indicator if loading traces', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper.find(LoadingIndicator).length).toBe(1);
  });

  it('hide scatter plot if queryparam hideGraph', () => {
    wrapper.setProps({ hideGraph: true, embed: true, getSearchURL: () => 'SEARCH_URL' });
    expect(wrapper.find(ScatterPlot).length).toBe(0);
  });

  it('hide DiffSelection when disableComparisons = true', () => {
    wrapper.setProps({ disableComparisons: true });
    expect(wrapper.find(DiffSelection).length).toBe(0);
  });

  describe('search finished with results', () => {
    it('shows a scatter plot', () => {
      expect(wrapper.find(ScatterPlot).length).toBe(1);
    });

    it('shows a result entry for each trace', () => {
      expect(wrapper.find(ResultItem).length).toBe(traces.length);
    });

    it('deep links traces', () => {
      const uiFind = 'ui-find';
      const spanLinks = {
        [traces[0].traceID]: uiFind,
      };
      wrapper.setProps({ spanLinks });
      const results = wrapper.find(ResultItem);
      expect(results.at(0).prop('linkTo').search).toBe(`uiFind=${uiFind}`);
      expect(results.at(1).prop('linkTo').search).toBeUndefined();
    });

    it('deep links traces with leading 0', () => {
      const uiFind0 = 'ui-find-0';
      const uiFind1 = 'ui-find-1';
      const traceID0 = '00traceID0';
      const traceID1 = 'traceID1';
      const spanLinks = {
        [traceID0]: uiFind0,
        [traceID1]: uiFind1,
      };
      const zeroIDTraces = [
        { traceID: traceID0, spans: [], processes: {} },
        { traceID: `000${traceID1}`, spans: [], processes: {} },
      ];
      wrapper.setProps({ spanLinks, traces: zeroIDTraces });
      const results = wrapper.find(ResultItem);
      expect(results.at(0).prop('linkTo').search).toBe(`uiFind=${uiFind0}`);
      expect(results.at(1).prop('linkTo').search).toBe(`uiFind=${uiFind1}`);
    });

  });
});
