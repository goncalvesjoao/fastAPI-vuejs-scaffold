/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** PostNatureEnum */
export enum PostNatureEnum {
  Scientific = "scientific",
  Standard = "standard",
  Journal = "journal",
}

/** CreatePostInputDto */
export interface CreatePostInputDto {
  /**
   * Title
   * @minLength 1
   * @maxLength 255
   */
  title: string;
  /**
   * Content
   * @minLength 1
   * @maxLength 255
   */
  content: string;
  nature?: PostNatureEnum | null;
}

/** HTTPErrorResponse */
export interface HTTPErrorResponse {
  /** Detail */
  detail: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail: ValidationError[];
}

/** HealthResult */
export interface HealthResult {
  /** Api */
  api: boolean;
  /** Database */
  database: boolean;
}

/** PaginatedRecords[PostPublic] */
export interface PaginatedRecordsPostPublic {
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
  /** Total Count */
  total_count: number;
  /** Total Pages */
  total_pages: number;
  /** Records */
  records: PostPublic[];
}

/** PostPublic */
export interface PostPublic {
  /**
   * Title
   * @minLength 1
   * @maxLength 255
   */
  title: string;
  /**
   * Content
   * @minLength 1
   * @maxLength 255
   */
  content: string;
  /**
   * @minLength 1
   * @maxLength 255
   */
  nature: PostNatureEnum;
  /**
   * User Uid
   * @minLength 1
   * @maxLength 255
   */
  user_uid: string;
  /** Id */
  id: number;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** UpdatePostInputDto */
export interface UpdatePostInputDto {
  /** Title */
  title?: string | null;
  /** Content */
  content?: string | null;
  nature?: PostNatureEnum | null;
}

/** ValidationError */
export interface ValidationError {
  /** Loc */
  loc: (string | number)[];
  /** Msg */
  msg: string;
  /** Type */
  type: string;
  /** Input */
  input: any;
  /** Ctx */
  ctx: any;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title FastAPI
 * @version 0.1.0
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @name HealthApiHealthGet
     * @summary Health
     * @request GET:/api/health
     */
    healthApiHealthGet: (params: RequestParams = {}) =>
      this.request<HealthResult, any>({
        path: `/api/health`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetPostsApiPostsGet
     * @summary Get Posts
     * @request GET:/api/posts
     */
    getPostsApiPostsGet: (
      query?: {
        /**
         * Page
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Page Size
         * @min 1
         * @max 100
         * @default 10
         */
        page_size?: number;
        /** Nature */
        nature?: PostNatureEnum | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        PaginatedRecordsPostPublic,
        HTTPErrorResponse | HTTPValidationError
      >({
        path: `/api/posts`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreatePostApiPostsPost
     * @summary Create Post
     * @request POST:/api/posts
     */
    createPostApiPostsPost: (
      data: CreatePostInputDto,
      params: RequestParams = {},
    ) =>
      this.request<PostPublic, HTTPErrorResponse | HTTPValidationError>({
        path: `/api/posts`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetPostApiPostsIdGet
     * @summary Get Post
     * @request GET:/api/posts/{id}
     */
    getPostApiPostsIdGet: (id: number, params: RequestParams = {}) =>
      this.request<PostPublic, HTTPErrorResponse | HTTPValidationError>({
        path: `/api/posts/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdatePostApiPostsIdPatch
     * @summary Update Post
     * @request PATCH:/api/posts/{id}
     */
    updatePostApiPostsIdPatch: (
      id: number,
      data: UpdatePostInputDto,
      params: RequestParams = {},
    ) =>
      this.request<PostPublic, HTTPErrorResponse | HTTPValidationError>({
        path: `/api/posts/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeletePostApiPostsIdDelete
     * @summary Delete Post
     * @request DELETE:/api/posts/{id}
     */
    deletePostApiPostsIdDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, HTTPErrorResponse | HTTPValidationError>({
        path: `/api/posts/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
}
