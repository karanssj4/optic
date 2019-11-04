import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DocGrid} from './DocGrid';
import {ListItemText, Typography} from '@material-ui/core';
import {DocDivider, DocSubHeading, SubHeadingStyles, SubHeadingTitleColor} from './DocConstants';
import {DocSubGroup} from './DocSubGroup';
import {DocParameter} from './DocParameter';
import {HeadingContribution, MarkdownContribution} from './DocContribution';
import DocCodeBox, {EndpointOverviewCodeBox, ExampleShapeViewer} from './DocCodeBox';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {DocButton, DocButtonGroup} from './ButtonGroup';
import {secondary} from '../../theme';
import {DocResponse} from './DocResponse';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Collapse from '@material-ui/core/Collapse';
import {DocRequest} from './DocRequest';
import {DocQueryParams} from './DocQueryParams';
import {withRfcContext} from '../../contexts/RfcContext';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {RequestUtilities} from '../../utilities/RequestUtilities';
import {RequestsCommandHelper} from '../../components/requests/RequestsCommandHelper';
import {getNormalizedBodyDescriptor} from '../../components/PathPage';
import Editor from '../../components/navigation/Editor';
import EndpointOverview from './EndpointOverview';
import {asPathTrail, getNameWithFormattedParameters, isPathParameter} from '../../components/utilities/PathUtilities';
import {updateContribution} from '../../engine/routines';
import sortBy from 'lodash.sortby';
import SubjectIcon from '@material-ui/core/SvgIcon/SvgIcon';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  root: {
    paddingTop: 45,
    paddingLeft: 22,
    paddingRight: 22,
    paddingBottom: 200
  },
  wrapper: {
    padding: 22,
    display: 'flex',
    width: '95%',
    marginTop: 22,
    marginBottom: 140,
    flexDirection: 'column',
    height: 'fit-content',
  },
  docButton: {
    paddingLeft: 9,
    borderLeft: '3px solid #e2e2e2',
    marginBottom: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },
  showMore: {
    marginTop: 44
  }
});

export const EndpointPageWithQuery = withStyles(styles)(withEditorContext(withRfcContext(({requestId, classes, handleCommand, handleCommands, mode, baseUrl, cachedQueryResults, inDiffMode}) => {

  const {apiName, requests, pathsById, responses, requestIdsByPathId, contributions, requestParameters} = cachedQueryResults;

  const request = requests[requestId];

  const {requestDescriptor} = request;
  const {httpMethod, pathComponentId, bodyDescriptor} = requestDescriptor;

  //Path
  const path = pathsById[pathComponentId];
  const pathTrail = asPathTrail(pathComponentId, pathsById);
  const pathTrailComponents = pathTrail.map(pathId => pathsById[pathId]);
  const pathTrailWithNames = pathTrailComponents.map((pathComponent) => {
    const pathComponentName = getNameWithFormattedParameters(pathComponent);
    const pathComponentId = pathComponent.pathId;
    return {
      pathComponentName,
      pathComponentId
    };
  });

  const fullPath = pathTrailWithNames.map(({pathComponentName}) => pathComponentName)
    .join('/');

  const pathParameters = pathTrail
    .map(pathId => pathsById[pathId])
    .filter((p) => isPathParameter(p))
    .map(p => ({pathId: p.pathId, name: p.descriptor.ParameterizedPathComponentDescriptor.name}));

  // Request Body
  const requestBody = getNormalizedBodyDescriptor(bodyDescriptor);

  // Responses
  const responsesForRequest = Object.values(responses)
    .filter((response) => response.responseDescriptor.requestId === requestId);

  const parametersForRequest = Object.values(requestParameters)
    .filter((requestParameter) => requestParameter.requestParameterDescriptor.requestId === requestId);

  const headerParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'header');
  const queryParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'query');

  return (
    <Editor>
      <div className={classes.wrapper}>
        <EndpointPage
          endpointPurpose={contributions.getOrUndefined(requestId, 'purpose')}
          endpointDescription={contributions.getOrUndefined(requestId, 'description')}
          requestId={requestId}
          updateContribution={(id, key, value) => {
            handleCommand(updateContribution(id, key, value));
          }}
          method={httpMethod}
          requestBody={requestBody}
          responses={sortBy(responsesForRequest, (res) => res.responseDescriptor.httpStatusCode)}
          url={fullPath}
          parameters={pathParameters}
        />
      </div>
    </Editor>
  );
})));

class _EndpointPage extends React.Component {

  state = {
    showAllResponses: false
  };

  toggleAllResponses = () => this.setState({showAllResponses: true});

  render() {
    const {
      classes,
      endpointPurpose,
      requestBody,
      responses,
      endpointDescription,
      method,
      url,
      parameters = [],
      updateContribution,
      requestId
    } = this.props;

    const endpointOverview = (() => {
      const left = (
        <div>
          <HeadingContribution
            value={endpointPurpose}
            label="What does this endpoint do?"
            onChange={(value) => {
              updateContribution(requestId, 'purpose', value);
            }}
          />
          <div style={{marginTop: -6, marginBottom: 6}}>
            <MarkdownContribution
              value={endpointDescription}
              label="Detailed Description"
              onChange={(value) => {
                updateContribution(requestId, 'description', value);
              }}/>
          </div>

          {parameters.length ? (
            <DocSubGroup title="Path Parameters">
              {parameters.map(i => <DocParameter title={i.name} paramId={i.pathId}/>)}
            </DocSubGroup>
          ) : null}
        </div>
      );

      const right = <EndpointOverviewCodeBox method={method} url={url}/>;

      return <DocGrid left={left} right={right}/>;
    })();

    // const qparams = [{title: 'filter'}, {title: 'count'}, {title: 'id'}];
    //
    // const queryParameters = <DocQueryParams parameters={qparams}
    //                                         example={{
    //                                           filter: '>50',
    //                                           count: 12,
    //                                           id: 'abcdefg'
    //                                         }}
    // />;


    const requestBodyRender = (() => {
      const {httpContentType, shapeId, isRemoved} = requestBody;
      if (Object.keys(requestBody).length && !isRemoved) {
        return (
          <DocRequest
            description={'Pass along the body to do the thing'}
            fields={[{title: 'fieldA', description: 'does something'}]}
            contentType={httpContentType}
            shapeId={shapeId}
            requestId={requestId}
            updateContribution={updateContribution}
            example={{weAre: 'penn state', state: 'PA'}}
          />
        );
      }
    })();


    const responsesRendered = (() => responses.map(response => {
      const {isRemoved, responseId, responseDescriptor} = response;
      const {httpStatusCode, bodyDescriptor} = responseDescriptor;
      const {httpContentType, shapeId} = getNormalizedBodyDescriptor(bodyDescriptor);

      return (
        <DocResponse
          statusCode={httpStatusCode}
          description={'The thing got deleted'}
          fields={[]}
          contentType={httpContentType}
          shapeId={shapeId}
          example={{weAre: 'penn state', state: 'PA'}}
        />
      );
    }))();

    const firstResponse = responsesRendered[0];
    const remainingResponses = responsesRendered.slice(1);

    const showButton = !this.state.showAllResponses && remainingResponses.length > 0;

    return (
      <div className={classes.root}>
        {endpointOverview}

        <div style={{marginTop: 65, marginBottom: 65}}/>
        {/*{queryParameters}*/}
        {requestBodyRender}
        <div style={{marginTop: 65, marginBottom: 65}}/>
        {firstResponse}

        {showButton && (
          <Button variant="outlined"
                  color="primary"
                  onClick={this.toggleAllResponses}
                  className={classes.showMore}>
                  <ExpandMoreIcon style={{marginRight: 6}}/>
                  Show ({remainingResponses.length}) Other Response{remainingResponses.length > 1 && 's'}
          </Button>
        )}
        <Collapse in={this.state.showAllResponses}>
          {remainingResponses}
        </Collapse>
      </div>
    );
  }
}

export const EndpointPage = withStyles(styles)(_EndpointPage);
