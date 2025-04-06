--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Evento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Evento" (
    id integer NOT NULL,
    nome text NOT NULL,
    local text NOT NULL,
    data timestamp(3) without time zone NOT NULL,
    finalizado boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pais text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    arrecadacao double precision,
    "payPerView" integer,
    "publicoTotal" integer
);


ALTER TABLE public."Evento" OWNER TO postgres;

--
-- Name: Evento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Evento_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Evento_id_seq" OWNER TO postgres;

--
-- Name: Evento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Evento_id_seq" OWNED BY public."Evento".id;


--
-- Name: Luta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Luta" (
    id integer NOT NULL,
    "eventoId" integer NOT NULL,
    "lutador1Id" integer NOT NULL,
    "lutador2Id" integer NOT NULL,
    "vencedorId" integer,
    "metodoVitoria" text,
    round integer,
    "disputaTitulo" boolean DEFAULT false NOT NULL,
    bonus text,
    categoria text NOT NULL,
    "noContest" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tempo text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Luta" OWNER TO postgres;

--
-- Name: Luta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Luta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Luta_id_seq" OWNER TO postgres;

--
-- Name: Luta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Luta_id_seq" OWNED BY public."Luta".id;


--
-- Name: Lutador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lutador" (
    id integer NOT NULL,
    nome text NOT NULL,
    pais text NOT NULL,
    sexo text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    altura double precision NOT NULL,
    apelido text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lutador" OWNER TO postgres;

--
-- Name: Lutador_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Lutador_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Lutador_id_seq" OWNER TO postgres;

--
-- Name: Lutador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Lutador_id_seq" OWNED BY public."Lutador".id;


--
-- Name: Ranking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ranking" (
    id integer NOT NULL,
    "lutadorId" integer NOT NULL,
    categoria text NOT NULL,
    posicao integer NOT NULL,
    pontos integer NOT NULL,
    "corFundo" text,
    variacao integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Ranking" OWNER TO postgres;

--
-- Name: Ranking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Ranking_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Ranking_id_seq" OWNER TO postgres;

--
-- Name: Ranking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Ranking_id_seq" OWNED BY public."Ranking".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Evento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evento" ALTER COLUMN id SET DEFAULT nextval('public."Evento_id_seq"'::regclass);


--
-- Name: Luta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta" ALTER COLUMN id SET DEFAULT nextval('public."Luta_id_seq"'::regclass);


--
-- Name: Lutador id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lutador" ALTER COLUMN id SET DEFAULT nextval('public."Lutador_id_seq"'::regclass);


--
-- Name: Ranking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ranking" ALTER COLUMN id SET DEFAULT nextval('public."Ranking_id_seq"'::regclass);


--
-- Data for Name: Evento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Evento" (id, nome, local, data, finalizado, "createdAt", pais, "updatedAt", arrecadacao, "payPerView", "publicoTotal") FROM stdin;
47	UFC 5: The Return of the Beast	Independence Arena	1995-04-07 12:00:00	t	2025-04-06 10:51:51.254	EUA	2025-04-06 12:19:52.483	\N	260000	6000
43	UFC 1: The Beginning	McNichols Sports Arena	1993-11-12 12:00:00	t	2025-04-06 04:28:58.514	EUA	2025-04-06 12:37:18.466	86000	86000	7800
45	FC 3: The American Dream	Grady Cole Center	1994-09-09 12:00:00	t	2025-04-06 08:10:41.736	EUA	2025-04-06 12:37:24.191	\N	320000	3000
44	UFC 2: No Way Out	Mammoth Gardens	1994-03-11 12:00:00	t	2025-04-06 07:30:42.002	EUA	2025-04-06 08:17:04.509	\N	\N	2000
46	UFC 4: Revenge of the Warriors	Expo Square Pavilion	1994-12-16 12:00:00	t	2025-04-06 09:59:51.991	EUA	2025-04-06 10:18:04.748	\N	120000	5857
\.


--
-- Data for Name: Luta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Luta" (id, "eventoId", "lutador1Id", "lutador2Id", "vencedorId", "metodoVitoria", round, "disputaTitulo", bonus, categoria, "noContest", "createdAt", tempo, "updatedAt") FROM stdin;
402	43	152	153	152	Nocaute	1	f	Performance da Noite	Peso Casado	f	2025-04-06 04:28:58.55	\N	2025-04-06 04:28:58.55
404	43	160	161	160	Finalização	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.396	\N	2025-04-06 04:34:00.396
406	43	152	154	152	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.4	\N	2025-04-06 04:34:00.4
407	43	158	159	158	Finalização	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.401	\N	2025-04-06 04:34:00.401
408	43	156	157	156	Finalização	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.403	\N	2025-04-06 04:34:00.403
409	43	154	155	154	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.405	\N	2025-04-06 04:34:00.405
403	43	156	152	156	Finalização	1	t	Performance da Noite	Peso Casado	f	2025-04-06 04:34:00.393	\N	2025-04-06 04:54:57.899
405	43	156	158	156	Finalização	1	f	Luta da Noite	Peso Casado	f	2025-04-06 04:34:00.398	\N	2025-04-06 04:55:03.531
410	44	156	159	156	Nocaute	1	t	\N	Peso Casado	f	2025-04-06 07:30:42.072	\N	2025-04-06 07:30:42.072
411	44	159	170	159	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.084	\N	2025-04-06 07:30:42.084
412	44	156	164	156	Finalização	1	f	Performance da Noite	Peso Casado	f	2025-04-06 07:30:42.093	\N	2025-04-06 07:30:42.093
413	44	159	173	159	Nocaute	1	f	Performance da Noite	Peso Casado	f	2025-04-06 07:30:42.1	\N	2025-04-06 07:30:42.1
414	44	170	175	170	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.106	\N	2025-04-06 07:30:42.106
415	44	164	166	164	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.112	\N	2025-04-06 07:30:42.112
416	44	156	160	156	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.119	\N	2025-04-06 07:30:42.119
417	44	173	174	173	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.125	\N	2025-04-06 07:30:42.125
418	44	159	172	159	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.132	\N	2025-04-06 07:30:42.132
419	44	170	171	170	Nocaute	3	f	\N	Peso Casado	f	2025-04-06 07:30:42.137	\N	2025-04-06 07:30:42.137
420	44	168	169	168	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.145	\N	2025-04-06 07:30:42.145
421	44	166	167	166	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.153	\N	2025-04-06 07:30:42.153
422	44	164	165	164	Finalização	2	f	\N	Peso Casado	f	2025-04-06 07:30:42.16	\N	2025-04-06 07:30:42.16
423	44	160	163	160	Nocaute	2	f	\N	Peso Casado	f	2025-04-06 07:30:42.167	\N	2025-04-06 07:30:42.167
424	44	156	162	156	Finalização	2	f	Luta da Noite	Peso Casado	f	2025-04-06 07:30:42.175	\N	2025-04-06 07:30:42.175
425	45	183	177	183	Nocaute	1	t	\N	Peso Casado	f	2025-04-06 08:10:41.757	\N	2025-04-06 08:10:41.757
426	45	158	182	158	Finalização	1	f	\N	Peso Casado	f	2025-04-06 08:10:41.771	\N	2025-04-06 08:10:41.771
427	45	180	181	180	Nocaute	1	f	Performance da Noite	Peso Casado	f	2025-04-06 08:10:41.779	\N	2025-04-06 08:10:41.779
428	45	158	179	158	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 08:10:41.786	\N	2025-04-06 08:10:41.786
429	45	177	178	177	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 08:10:41.792	\N	2025-04-06 08:10:41.792
430	45	156	176	156	Finalização	1	f	Luta da Noite,Performance da Noite	Peso Casado	f	2025-04-06 08:10:41.798	\N	2025-04-06 08:10:41.798
431	46	156	189	156	Finalização	4	t	Luta da Noite,Performance da Noite	Peso Casado	f	2025-04-06 09:59:52.047	\N	2025-04-06 09:59:52.047
432	46	156	180	156	Finalização	2	f	\N	Peso Casado	f	2025-04-06 09:59:52.059	\N	2025-04-06 09:59:52.059
433	46	189	186	189	Finalização	1	f	\N	Peso Casado	f	2025-04-06 09:59:52.065	\N	2025-04-06 09:59:52.065
434	46	156	193	156	Finalização	1	f	\N	Peso Casado	f	2025-04-06 09:59:52.071	\N	2025-04-06 09:59:52.071
435	46	180	192	180	Finalização	1	f	\N	Peso Casado	f	2025-04-06 09:59:52.078	\N	2025-04-06 09:59:52.078
436	46	183	191	183	Finalização	1	f	\N	Peso Casado	f	2025-04-06 09:59:52.086	\N	2025-04-06 09:59:52.086
437	46	189	190	189	Finalização	1	f	\N	Peso Casado	f	2025-04-06 09:59:52.092	\N	2025-04-06 09:59:52.092
438	46	188	154	188	Finalização	1	f	\N	Peso Casado	f	2025-04-06 09:59:52.098	\N	2025-04-06 09:59:52.098
439	46	186	187	186	Nocaute	1	f	Performance da Noite	Peso Casado	f	2025-04-06 09:59:52.103	\N	2025-04-06 09:59:52.103
440	46	184	185	184	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 09:59:52.109	\N	2025-04-06 09:59:52.109
441	47	195	199	195	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 10:51:51.298	\N	2025-04-06 10:51:51.298
442	47	189	197	189	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 10:51:51.311	\N	2025-04-06 10:51:51.311
443	47	201	202	201	Nocaute	1	f	Performance da Noite	Peso Casado	f	2025-04-06 10:51:51.317	\N	2025-04-06 10:51:51.317
444	47	199	200	199	Finalização	1	f	\N	Peso Casado	f	2025-04-06 10:51:51.323	\N	2025-04-06 10:51:51.323
445	47	197	198	197	Finalização	1	f	Luta da Noite,Performance da Noite	Peso Casado	f	2025-04-06 10:51:51.328	\N	2025-04-06 10:51:51.328
446	47	189	188	189	Finalização	1	f	\N	Peso Casado	f	2025-04-06 10:51:51.334	\N	2025-04-06 10:51:51.334
447	47	195	196	195	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 10:51:51.339	\N	2025-04-06 10:51:51.339
448	47	184	194	184	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 10:51:51.345	\N	2025-04-06 10:51:51.345
449	47	158	156	\N	\N	1	f	\N	Peso Casado	f	2025-04-06 12:19:52.51	\N	2025-04-06 12:19:52.51
\.


--
-- Data for Name: Lutador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lutador" (id, nome, pais, sexo, "createdAt", altura, apelido, "updatedAt") FROM stdin;
152	Gerard Gordeau	Holanda	Masculino	2025-04-06 04:28:34.643	1.8	\N	2025-04-06 04:28:34.643
153	Teila Tuli	EUA	Masculino	2025-04-06 04:28:42.139	1.8	\N	2025-04-06 04:28:42.139
154	Kevin Rosier	EUA	Masculino	2025-04-06 04:30:57.688	1.8	\N	2025-04-06 04:30:57.688
155	Zane Frazier	EUA	Masculino	2025-04-06 04:31:03.169	1.8	\N	2025-04-06 04:31:03.169
156	Royce Gracie	Brasil	Masculino	2025-04-06 04:31:23.237	1.8	\N	2025-04-06 04:31:23.237
157	Art Jimmerson	EUA	Masculino	2025-04-06 04:31:30.058	1.8	\N	2025-04-06 04:31:30.058
158	Ken Shamrock	EUA	Masculino	2025-04-06 04:32:02.656	1.8	\N	2025-04-06 04:32:02.656
159	Patrick Smith	EUA	Masculino	2025-04-06 04:32:08.956	1.8	\N	2025-04-06 04:32:08.956
160	Jason DeLucia	EUA	Masculino	2025-04-06 04:33:13.538	1.8	\N	2025-04-06 04:33:13.538
161	Trent Jenkins	EUA	Masculino	2025-04-06 04:33:25.792	1.8	\N	2025-04-06 04:33:25.792
162	Minoki Ichihara	Japão	Masculino	2025-04-06 07:19:30.36	1.8	\N	2025-04-06 07:19:30.36
163	Scott Baker	EUA	Masculino	2025-04-06 07:20:11.94	1.8	\N	2025-04-06 07:20:11.94
164	Remco Pardoel	Holanda	Masculino	2025-04-06 07:20:52.274	1.8	\N	2025-04-06 07:20:52.274
165	Alberto Cerro Leon	Espanha	Masculino	2025-04-06 07:21:03.805	1.8	\N	2025-04-06 07:21:03.805
166	Orlando Wiet	Holanda	Masculino	2025-04-06 07:23:24.423	1.8	\N	2025-04-06 07:23:24.423
167	Robert Lucarelli	EUA	Masculino	2025-04-06 07:23:57.571	1.8	\N	2025-04-06 07:23:57.571
168	Frank Hamaker	Holanda	Masculino	2025-04-06 07:24:32.269	1.8	\N	2025-04-06 07:24:32.269
169	Thaddeus Luster	EUA	Masculino	2025-04-06 07:24:42.137	1.8	\N	2025-04-06 07:24:42.137
170	Johnny Rhodes	EUA	Masculino	2025-04-06 07:25:17.402	1.8	\N	2025-04-06 07:25:17.402
171	David Levicki	EUA	Masculino	2025-04-06 07:25:31.915	1.8	\N	2025-04-06 07:25:31.915
172	Ray Wizard	EUA	Masculino	2025-04-06 07:26:01.801	1.8	\N	2025-04-06 07:26:01.801
173	Scott Morris	EUA	Masculino	2025-04-06 07:26:24.432	1.8	\N	2025-04-06 07:26:24.432
174	Sean Daugherty	EUA	Masculino	2025-04-06 07:26:36.35	1.8	\N	2025-04-06 07:26:36.35
175	Fred Ettish	EUA	Masculino	2025-04-06 07:27:55.332	1.8	\N	2025-04-06 07:27:55.332
176	Kimo Leopoldo	EUA	Masculino	2025-04-06 08:07:20.325	1.8	\N	2025-04-06 08:07:20.325
177	Harold Howard	Canadá	Masculino	2025-04-06 08:08:01.093	1.8	\N	2025-04-06 08:08:01.093
178	Roland Payne	EUA	Masculino	2025-04-06 08:08:06.408	1.8	\N	2025-04-06 08:08:06.408
179	Christophe Leininger	EUA	Masculino	2025-04-06 08:08:38.565	1.8	\N	2025-04-06 08:08:38.565
180	Keith Hackney	EUA	Masculino	2025-04-06 08:08:58.822	1.8	\N	2025-04-06 08:08:58.822
181	Emmanuel Yarbrough	EUA	Masculino	2025-04-06 08:09:09.774	1.8	\N	2025-04-06 08:09:09.774
182	Felix Mitchell	EUA	Masculino	2025-04-06 08:09:46.889	1.8	\N	2025-04-06 08:09:46.889
183	Steve Jennum	EUA	Masculino	2025-04-06 08:10:08.691	1.8	\N	2025-04-06 08:10:08.691
184	Guy Mezger	EUA	Masculino	2025-04-06 09:53:28.767	1.8	\N	2025-04-06 09:53:28.767
185	Jason Fairn	Canadá	Masculino	2025-04-06 09:54:05.222	1.8	\N	2025-04-06 09:54:05.222
186	Marcus Bossett	EUA	Masculino	2025-04-06 09:54:35.487	1.8	\N	2025-04-06 09:54:35.487
187	Eldo Dias Xavier	Brasil	Masculino	2025-04-06 09:54:45.769	1.8	\N	2025-04-06 09:54:45.769
188	Joe Charles	EUA	Masculino	2025-04-06 09:55:13.705	1.8	\N	2025-04-06 09:55:13.705
189	Dan Severn	EUA	Masculino	2025-04-06 09:55:40.868	1.8	\N	2025-04-06 09:55:40.868
190	Anthony Macias	EUA	Masculino	2025-04-06 09:55:53.784	1.8	\N	2025-04-06 09:55:53.784
191	Melton Bowen	EUA	Masculino	2025-04-06 09:56:30.523	1.8	\N	2025-04-06 09:56:30.523
192	Joe Son	EUA	Masculino	2025-04-06 09:57:12.535	1.8	\N	2025-04-06 09:57:12.535
193	Ron van Clief	EUA	Masculino	2025-04-06 09:57:47.867	1.8	\N	2025-04-06 09:57:47.867
194	John Dowdy	EUA	Masculino	2025-04-06 10:42:40.579	1.8	\N	2025-04-06 10:42:40.579
195	Dave Beneteau	Canadá	Masculino	2025-04-06 10:43:37.611	1.8	\N	2025-04-06 10:43:37.611
196	Asbel Cancio	EUA	Masculino	2025-04-06 10:43:53.719	1.8	\N	2025-04-06 10:43:53.719
197	Oleg Taktarov	Rússia	Masculino	2025-04-06 10:45:21.248	1.8	\N	2025-04-06 10:45:21.248
198	Ernie Verdicia	EUA	Masculino	2025-04-06 10:45:37.747	1.8	\N	2025-04-06 10:45:37.747
199	Todd Medina	EUA	Masculino	2025-04-06 10:46:13.531	1.8	\N	2025-04-06 10:46:13.531
200	Larry Cureton	EUA	Masculino	2025-04-06 10:46:23.13	1.8	\N	2025-04-06 10:46:23.13
201	Jon Hess	EUA	Masculino	2025-04-06 10:46:46.5	1.8	\N	2025-04-06 10:46:46.5
202	Andy Anderson	EUA	Masculino	2025-04-06 10:46:58.632	1.8	\N	2025-04-06 10:46:58.632
\.


--
-- Data for Name: Ranking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Ranking" (id, "lutadorId", categoria, posicao, pontos, "corFundo", variacao, "createdAt", "updatedAt") FROM stdin;
1134	156	Peso por Peso	1	135	dourado-escuro	0	2025-04-06 12:37:24.278	2025-04-06 12:37:24.278
1135	189	Peso por Peso	2	37	dourado-claro	0	2025-04-06 12:37:24.28	2025-04-06 12:37:24.28
1136	158	Peso por Peso	3	24	dourado-claro	0	2025-04-06 12:37:24.282	2025-04-06 12:37:24.282
1137	183	Peso por Peso	4	20	dourado-claro	0	2025-04-06 12:37:24.283	2025-04-06 12:37:24.283
1138	159	Peso por Peso	5	20	dourado-claro	0	2025-04-06 12:37:24.285	2025-04-06 12:37:24.285
1139	184	Peso por Peso	6	17	azul-escuro	0	2025-04-06 12:37:24.287	2025-04-06 12:37:24.287
1140	195	Peso por Peso	7	17	azul-escuro	0	2025-04-06 12:37:24.288	2025-04-06 12:37:24.288
1141	152	Peso por Peso	8	15	azul-escuro	0	2025-04-06 12:37:24.289	2025-04-06 12:37:24.289
1142	180	Peso por Peso	9	12	azul-escuro	0	2025-04-06 12:37:24.29	2025-04-06 12:37:24.29
1143	164	Peso por Peso	10	11	azul-escuro	0	2025-04-06 12:37:24.291	2025-04-06 12:37:24.291
1144	160	Peso por Peso	11	10	azul-escuro	0	2025-04-06 12:37:24.294	2025-04-06 12:37:24.294
1145	170	Peso por Peso	12	10	azul-escuro	0	2025-04-06 12:37:24.295	2025-04-06 12:37:24.295
1146	201	Peso por Peso	13	9	azul-escuro	0	2025-04-06 12:37:24.296	2025-04-06 12:37:24.296
1147	168	Peso por Peso	14	8	azul-escuro	0	2025-04-06 12:37:24.297	2025-04-06 12:37:24.297
1148	177	Peso por Peso	15	6	azul-escuro	0	2025-04-06 12:37:24.298	2025-04-06 12:37:24.298
1149	197	Peso por Peso	16	5		0	2025-04-06 12:37:24.3	2025-04-06 12:37:24.3
1150	186	Peso por Peso	17	4		0	2025-04-06 12:37:24.301	2025-04-06 12:37:24.301
1151	166	Peso por Peso	18	3		0	2025-04-06 12:37:24.303	2025-04-06 12:37:24.303
1152	173	Peso por Peso	19	3		0	2025-04-06 12:37:24.304	2025-04-06 12:37:24.304
1153	188	Peso por Peso	20	3		0	2025-04-06 12:37:24.306	2025-04-06 12:37:24.306
1154	199	Peso por Peso	21	3		0	2025-04-06 12:37:24.307	2025-04-06 12:37:24.307
1155	154	Peso por Peso	22	-2		0	2025-04-06 12:37:24.308	2025-04-06 12:37:24.308
1156	162	Peso por Peso	23	-4		0	2025-04-06 12:37:24.31	2025-04-06 12:37:24.31
1157	176	Peso por Peso	24	-4		0	2025-04-06 12:37:24.312	2025-04-06 12:37:24.312
1158	198	Peso por Peso	25	-4		0	2025-04-06 12:37:24.312	2025-04-06 12:37:24.312
1159	153	Peso por Peso	26	-5		0	2025-04-06 12:37:24.313	2025-04-06 12:37:24.313
1160	155	Peso por Peso	27	-5		0	2025-04-06 12:37:24.316	2025-04-06 12:37:24.316
1161	157	Peso por Peso	28	-5		0	2025-04-06 12:37:24.317	2025-04-06 12:37:24.317
1162	161	Peso por Peso	29	-5		0	2025-04-06 12:37:24.319	2025-04-06 12:37:24.319
1163	163	Peso por Peso	30	-5		0	2025-04-06 12:37:24.32	2025-04-06 12:37:24.32
1164	165	Peso por Peso	31	-5		0	2025-04-06 12:37:24.321	2025-04-06 12:37:24.321
1165	167	Peso por Peso	32	-5		0	2025-04-06 12:37:24.322	2025-04-06 12:37:24.322
1166	169	Peso por Peso	33	-5		0	2025-04-06 12:37:24.323	2025-04-06 12:37:24.323
1167	171	Peso por Peso	34	-5		0	2025-04-06 12:37:24.324	2025-04-06 12:37:24.324
1168	172	Peso por Peso	35	-5		0	2025-04-06 12:37:24.326	2025-04-06 12:37:24.326
1169	174	Peso por Peso	36	-5		0	2025-04-06 12:37:24.327	2025-04-06 12:37:24.327
1170	175	Peso por Peso	37	-5		0	2025-04-06 12:37:24.329	2025-04-06 12:37:24.329
1171	178	Peso por Peso	38	-5		0	2025-04-06 12:37:24.33	2025-04-06 12:37:24.33
1172	179	Peso por Peso	39	-5		0	2025-04-06 12:37:24.332	2025-04-06 12:37:24.332
1173	181	Peso por Peso	40	-5		0	2025-04-06 12:37:24.334	2025-04-06 12:37:24.334
1174	182	Peso por Peso	41	-5		0	2025-04-06 12:37:24.336	2025-04-06 12:37:24.336
1175	185	Peso por Peso	42	-5		0	2025-04-06 12:37:24.337	2025-04-06 12:37:24.337
1176	187	Peso por Peso	43	-5		0	2025-04-06 12:37:24.338	2025-04-06 12:37:24.338
1177	190	Peso por Peso	44	-5		0	2025-04-06 12:37:24.339	2025-04-06 12:37:24.339
1178	191	Peso por Peso	45	-5		0	2025-04-06 12:37:24.341	2025-04-06 12:37:24.341
1179	192	Peso por Peso	46	-5		0	2025-04-06 12:37:24.345	2025-04-06 12:37:24.345
1180	193	Peso por Peso	47	-5		0	2025-04-06 12:37:24.349	2025-04-06 12:37:24.349
1181	194	Peso por Peso	48	-5		0	2025-04-06 12:37:24.351	2025-04-06 12:37:24.351
1182	196	Peso por Peso	49	-5		0	2025-04-06 12:37:24.353	2025-04-06 12:37:24.353
1183	200	Peso por Peso	50	-5		0	2025-04-06 12:37:24.355	2025-04-06 12:37:24.355
1184	202	Peso por Peso	51	-5		0	2025-04-06 12:37:24.356	2025-04-06 12:37:24.356
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5e9f326e-1219-444d-b79d-468f09946976	38da17792910281b5a888ef51c4d975729e31d2fbbf3aff458baa2051760a6e0	2025-04-06 03:15:44.310655+00	20250401092337_init	\N	\N	2025-04-06 03:15:44.296214+00	1
343d3157-72a1-4a4b-bbb3-2122f35569f5	331d4bbc6084abcb4ea4b507422a0b7fa6695b0add67c4c529b2baf0eb22cfa9	2025-04-06 03:15:44.313155+00	20250401094742_add_finalizado_evento	\N	\N	2025-04-06 03:15:44.311244+00	1
b91c8de6-81a4-4825-bc39-217d2083c359	8f2d001a9bd9d3bb3673af735d1e82b0ffe91f641990f43a0c7e72ce3635342e	2025-04-06 03:15:44.318268+00	20250401101146_add_recorde_model	\N	\N	2025-04-06 03:15:44.313677+00	1
4e830b31-3fa2-4d7e-8271-0ab885f6239b	000e5eb5f28f1202f503f6f9c92bb85f3142b96e67217e6174346f7e0beb4a64	2025-04-06 03:15:44.321023+00	20250401102555_add_variacao_ranking	\N	\N	2025-04-06 03:15:44.318949+00	1
128fa708-918e-418a-b2db-fac3a354929b	834cad4547c237e52c066817b82a455595c7baddb9b4f83a799c085101ea4cfb	2025-04-06 03:15:44.324484+00	20250403054124_	\N	\N	2025-04-06 03:15:44.321787+00	1
721e33a6-4204-46ff-a37e-06207bf7467a	1f3dea53e9ab61a071bed77af2937bb799bde682684a537203839230340ba355	2025-04-06 03:17:13.171062+00	20250406031705_add_event_statistics	\N	\N	2025-04-06 03:17:13.167395+00	1
2518f426-26ae-4400-9818-a03b891fc18d	d44efa64b87192201ebb2888a92cb8fea42d0870642f246e01826e1b17525181	\N	20250406034900_add_evento_metrics	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250406034900_add_evento_metrics\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "publicoTotal" of relation "Evento" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"publicoTotal\\" of relation \\"Evento\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7246), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250406034900_add_evento_metrics"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250406034900_add_evento_metrics"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:225	\N	2025-04-06 04:51:51.358339+00	0
\.


--
-- Name: Evento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Evento_id_seq"', 47, true);


--
-- Name: Luta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Luta_id_seq"', 449, true);


--
-- Name: Lutador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Lutador_id_seq"', 202, true);


--
-- Name: Ranking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ranking_id_seq"', 1184, true);


--
-- Name: Evento Evento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evento"
    ADD CONSTRAINT "Evento_pkey" PRIMARY KEY (id);


--
-- Name: Luta Luta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_pkey" PRIMARY KEY (id);


--
-- Name: Lutador Lutador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lutador"
    ADD CONSTRAINT "Lutador_pkey" PRIMARY KEY (id);


--
-- Name: Ranking Ranking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ranking"
    ADD CONSTRAINT "Ranking_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Lutador_nome_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Lutador_nome_key" ON public."Lutador" USING btree (nome);


--
-- Name: Luta Luta_eventoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES public."Evento"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Luta Luta_lutador1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_lutador1Id_fkey" FOREIGN KEY ("lutador1Id") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Luta Luta_lutador2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_lutador2Id_fkey" FOREIGN KEY ("lutador2Id") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Luta Luta_vencedorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_vencedorId_fkey" FOREIGN KEY ("vencedorId") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ranking Ranking_lutadorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ranking"
    ADD CONSTRAINT "Ranking_lutadorId_fkey" FOREIGN KEY ("lutadorId") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

